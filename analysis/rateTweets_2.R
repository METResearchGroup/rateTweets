setwd(dirname(rstudioapi::getSourceEditorContext()$path))

rm(list = ls())

library(dplyr)

# read in CSVs from data folder, and combine them into one data frame
data <- list.files(path = "data", pattern = "*.csv", full.names = TRUE)
data <- lapply(data, read.csv)
data <- do.call(rbind, data)

# prolific demographics data
prolific_dem <- read.csv("data/prolific/dem_prolific_export_671a6e9ce2e8c62721d6c06f.csv")
prolific_rep <- read.csv("data/prolific/rep_prolific_export_672a8a0e6efd077ff1e58c49.csv")

# read in image tags
image_tags <- read.csv("../stim_images_v2_covariate_sheet_political.csv")
image_tags$filename <- sub("PNG$", "png", image_tags$filename)

# read in converted json file
participant_assignments <- read.csv("participant_assignments.csv")

# make a new data frame, showing the frequency of each image_shown
image_freq <- data.frame(table(data$image_shown))
# ignore empty rows (") in data$image_shown
image_freq <- image_freq[image_freq$Var1 != "",]

# add image_tags$partisan and image_tags$label to the image_freq data frame by matching on image_shown
image_freq$partisan <- image_tags$partisan[match(image_freq$Var1, image_tags$filename)]
image_freq$label <- image_tags$label[match(image_freq$Var1, image_tags$filename)]

# write.csv(image_freq, "image_freq.csv", row.names = FALSE)

# add image_tags$partisan and image_tags$label to the data data frame by matching on image_shown
data$partisan <- image_tags$partisan[match(data$image_shown, image_tags$filename)]
data$label <- image_tags$label[match(data$image_shown, image_tags$filename)]

# print the column number of each column in data
for (i in 1:ncol(data)) {
  print(i)
  print(colnames(data)[i])
}

# reorder columns
data <- data[, c(1:5,30,31,32,6:29)]

# write.csv(data, "all_data.csv", row.names = FALSE)

######################
###### CLEANING ######
######################

# print prolific_id in participant_assignments but not in data
participant_assignments$participant_id[!participant_assignments$participant_id %in% data$prolific_id]

# 66864148763565064cf73355 did not complete study but was assigned id 48, not in data
# removed from assignments

# 6643f4b1e70df88c8267ceb30 did not complete study but was assigned id 31, not in data
# removed from assignments

# print unique prolific_id in data
length(unique(data$prolific_id))

data$prolific_id[!data$prolific_id %in% participant_assignments$participant_id]

# answered rep in dem: 65ca7d29af5b6440d955430a, 67214a183205028a0e314764, 6564a38fd32c131677616039, 66bf519b34c66d259e5554d1
# answered dem in rep:

######################
###### CLEANING ######
######################


# form two groups of participants:
# 1. participants who rated all political images (i.e., not neutral) 4 or above
# 2. participants who rated all political images 3 or below



# create dataframe listing high and low raters for each image
image_ratings_summary <- data %>%
  group_by(image_shown) %>%
  summarize(
    high_raters = paste(unique(prolific_id[response >= 4]), collapse = ", "),
    high_ratings = paste(response[response >= 4], collapse = ", "),
    low_raters = paste(unique(prolific_id[response <= 3]), collapse = ", "),
    low_ratings = paste(response[response <= 3], collapse = ", ")
    # mean_rating = mean(response, na.rm = TRUE),
    # high_mean = mean(response[response >= 4], na.rm = TRUE),
    # low_mean = mean(response[response < 3], na.rm = TRUE)
  )

# merge w/ image_tags
image_tags_with_raters <- image_tags %>%
  left_join(image_ratings_summary, by = c("filename" = "image_shown"))


# for a given image, get all users who rated 6-7
# from those users, filter anyone in used_users
# if there are still users available, randomly select one
# if no users w/ 6-7, then get all users who rated 4-5
# from those users, filter out anyone in used_users
# if there are still users available, randomly select one
# if no available users w/ either rating, return NA


# function to get potential posters for an image
get_potential_posters <- function(image_data, used_users) {
  
  # get all ratings for this image
  image_ratings <- data %>%
    filter(image_shown == image_data$filename) %>%
    select(prolific_id, response)
  
  # find users who rated 6-7
  high_posters <- image_ratings %>%
    filter(response >= 6, !prolific_id %in% used_users)
  
  if(nrow(high_posters) > 0) {
    selected <- high_posters[sample(nrow(high_posters), 1), ]
    return(list(id = selected$prolific_id, rating = selected$response))
  }
  
  # if no 6-7, find 4-5
  med_posters <- image_ratings %>%
    filter(response >= 4, response <= 5, !prolific_id %in% used_users)
  
  if(nrow(med_posters) > 0) {
    selected <- med_posters[sample(nrow(med_posters), 1), ]
    return(list(id = selected$prolific_id, rating = selected$response))
  }
  
  return(list(id = NA, rating = NA)) # return NA if no users found
}

# create distribution of likely posters
set.seed(123)
used_users <- c()
image_tags_with_raters$likely_poster <- NA
image_tags_with_raters$poster_rating <- NA

# # call function for each image
# for(i in 1:nrow(image_tags_with_raters)) {
#   result <- get_potential_posters(image_tags_with_raters[i,], used_users)
#   if(!is.na(result$id)) {
#     image_tags_with_raters$likely_poster[i] <- result$id
#     image_tags_with_raters$poster_rating[i] <- result$rating
#     used_users <- c(used_users, result$id)
#   }
# }

# use sample to randomize order
random_order <- sample(1:nrow(image_tags_with_raters))

# call function in random order
for(i in random_order) {
  result <- get_potential_posters(image_tags_with_raters[i,], used_users)
  if(!is.na(result$id)) {
    image_tags_with_raters$likely_poster[i] <- result$id
    image_tags_with_raters$poster_rating[i] <- result$rating
    used_users <- c(used_users, result$id)
  }
}







