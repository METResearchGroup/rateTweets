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
    high_ratings = paste(response[response >= 4], collapse = ", ")
    # low_raters = paste(unique(prolific_id[response <= 3]), collapse = ", "),
    # low_ratings = paste(response[response <= 3], collapse = ", ")
  )

# merge w/ image_tags
image_tags_with_raters <- image_tags %>%
  left_join(image_ratings_summary, by = c("filename" = "image_shown"))





#################################################################################################
################### compute prescriptive blame, praise, emotion, poli ratings ###################
#################################################################################################


# df of all precriptive ratings
prescriptive_ratings <- data %>%
  select(prolific_id, blame_prescriptive, praise_prescriptive, emotion_prescriptive, poli_prescriptive) %>%
  distinct()

prescriptive_ratings$blame_prescriptive = recode(prescriptive_ratings$blame_prescriptive, "1" = -3, "2" = -2, "3" = 1, "4" = 0, "5" = 1, "6" = 2, "7" = 3)
prescriptive_ratings$praise_prescriptive = recode(prescriptive_ratings$praise_prescriptive, "1" = -3, "2" = -2, "3" = 1, "4" = 0, "5" = 1, "6" = 2, "7" = 3)
prescriptive_ratings$emotion_prescriptive = recode(prescriptive_ratings$emotion_prescriptive, "1" = -3, "2" = -2, "3" = 1, "4" = 0, "5" = 1, "6" = 2, "7" = 3)
prescriptive_ratings$poli_prescriptive = recode(prescriptive_ratings$poli_prescriptive, "1" = -3, "2" = -2, "3" = 1, "4" = 0, "5" = 1, "6" = 2, "7" = 3)

# function to get ratings for high raters of each image
get_high_rater_ratings <- function(high_raters_str, ratings_df) {
  if (is.na(high_raters_str) || high_raters_str == "") return(NA)
  high_rater_ids <- strsplit(high_raters_str, ", ")[[1]]
  ratings <- ratings_df %>%
    filter(prolific_id %in% high_rater_ids) %>%
    select(-prolific_id)
  ratings <- ratings[!is.na(ratings)] # Remove NA values
  if (length(ratings) == 0) return(NA)
  paste(unlist(ratings), collapse = ", ")
}

# add the prescriptive rating columns for high raters
image_tags_with_raters <- image_tags_with_raters %>%
  mutate(
    high_rater_blame = mapply(get_high_rater_ratings, high_raters, 
                              MoreArgs = list(ratings_df = select(prescriptive_ratings, prolific_id, blame_prescriptive))),
    high_rater_praise = mapply(get_high_rater_ratings, high_raters, 
                               MoreArgs = list(ratings_df = select(prescriptive_ratings, prolific_id, praise_prescriptive))),
    high_rater_emotion = mapply(get_high_rater_ratings, high_raters, 
                                MoreArgs = list(ratings_df = select(prescriptive_ratings, prolific_id, emotion_prescriptive))),
    high_rater_political = mapply(get_high_rater_ratings, high_raters, 
                                  MoreArgs = list(ratings_df = select(prescriptive_ratings, prolific_id, poli_prescriptive)))
  )

# calculate image rating means
mean_image_tags_with_raters <- image_tags_with_raters %>%
  mutate(
    # high_ratings_numeric = lapply(strsplit(high_ratings, ", "), function(x) {
    #   nums <- as.numeric(x)
    #   nums[!is.na(nums)]
    # }),
    # low_ratings_numeric = lapply(strsplit(low_ratings, ", "), function(x) {
    #   nums <- as.numeric(x)
    #   nums[!is.na(nums)]
    # }),
    high_rater_blame_numeric = lapply(strsplit(high_rater_blame, ", "), function(x) {
      nums <- as.numeric(x)
      nums[!is.na(nums)]
    }),
    high_rater_praise_numeric = lapply(strsplit(high_rater_praise, ", "), function(x) {
      nums <- as.numeric(x)
      nums[!is.na(nums)]
    }),
    high_rater_emotion_numeric = lapply(strsplit(high_rater_emotion, ", "), function(x) {
      nums <- as.numeric(x)
      nums[!is.na(nums)]
    }),
    high_rater_political_numeric = lapply(strsplit(high_rater_political, ", "), function(x) {
      nums <- as.numeric(x)
      nums[!is.na(nums)]
    }),
    # high_mean = sapply(high_ratings_numeric, function(x) if(length(x) > 0) mean(x) else NA),
    # low_mean = sapply(low_ratings_numeric, function(x) if(length(x) > 0) mean(x) else NA),
    # all_ratings = Map(c, high_ratings_numeric, low_ratings_numeric),
    # mean_rating = sapply(all_ratings, function(x) if(length(x) > 0) mean(x) else NA)
    high_rater_blame_mean = sapply(high_rater_blame_numeric, function(x) if(length(x) > 0) mean(x) else NA),
    high_rater_praise_mean = sapply(high_rater_praise_numeric, function(x) if(length(x) > 0) mean(x) else NA),
    high_rater_emotion_mean = sapply(high_rater_emotion_numeric, function(x) if(length(x) > 0) mean(x) else NA),
    high_rater_political_mean = sapply(high_rater_political_numeric, function(x) if(length(x) > 0) mean(x) else NA)
  ) %>%
  # select(-high_ratings_numeric, -low_ratings_numeric, -all_ratings)
  select(-high_rater_blame_numeric, -high_rater_praise_numeric, -high_rater_emotion_numeric, -high_rater_political_numeric)


# compute the mean of the high_rater_blame_mean column
blame_mean = mean(mean_image_tags_with_raters$high_rater_blame_mean, na.rm = TRUE)
praise_mean = mean(mean_image_tags_with_raters$high_rater_praise_mean, na.rm = TRUE)
emotion_mean = mean(mean_image_tags_with_raters$high_rater_emotion_mean, na.rm = TRUE)
political_mean = mean(mean_image_tags_with_raters$high_rater_political_mean, na.rm = TRUE)

print(blame_mean)
print(praise_mean)
print(emotion_mean)
print(political_mean)



##################################################################
############# OLD image sorting w/ sample & replace ##############
##################################################################



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

# count the NA values in image_tags_with_raters$poster_rating
sum(is.na(image_tags_with_raters$poster_rating)) # 243

# create a data frame of the images that did not get a likely poster
no_poster <- image_tags_with_raters[is.na(image_tags_with_raters$poster_rating),]


# get the mean of poster_rating for partisan = Democrat, Republican, and N/A
mean_dem <- mean(image_tags_with_raters$poster_rating[image_tags_with_raters$partisan == "Democrat"], na.rm = TRUE)
mean_rep <- mean(image_tags_with_raters$poster_rating[image_tags_with_raters$partisan == "Republican"], na.rm = TRUE)
mean_neut <- mean(image_tags_with_raters$poster_rating[image_tags_with_raters$partisan == "N/A"], na.rm = TRUE)

# get the mean of poster_rating for each label
mean_labels <- image_tags_with_raters %>%
  group_by(label) %>%
  summarize(mean_rating = mean(poster_rating, na.rm = TRUE))

mean_labels_rep <- image_tags_with_raters %>%
  group_by(label) %>%
  summarize(mean_rating = mean(poster_rating[image_tags_with_raters$partisan == "Republican"], na.rm = TRUE))

mean_labels_dem <- image_tags_with_raters %>%
  group_by(label) %>%
  summarize(mean_rating = mean(poster_rating[image_tags_with_raters$partisan == "Democrat"], na.rm = TRUE))



# mean appropriateness ratings from studies 2, 3, & 3k

s2_data = read.csv("yourfeed_data/qualtrics_s2_MERGED.csv") # dem = e1DXnn, rep = egNJun
s3_data = read.csv("yourfeed_data/qualtrics_s3_MERGED.csv") # dem = ew5WPg, rep = ea8FMd
s3k_data = read.csv("yourfeed_data/qualtrics_s3_3k_MERGED.csv") # dem = ewMHzB, rep = eNqCUq

# re-code -3, -2, -1, 0, 1, 2, 3 to 1, 2, 3, 4, 5, 6, 7
s2_data$blame_prescriptive = recode(s2_data$blame_prescriptive, "-3" = 1, "-2" = 2, "-1" = 3, "0" = 4, "1" = 5, "2" = 6, "3" = 7)
s2_data$praise_prescriptive = recode(s2_data$praise_prescriptive, "-3" = 1, "-2" = 2, "-1" = 3, "0" = 4, "1" = 5, "2" = 6, "3" = 7)
s3_data$blame_prescriptive = recode(s3_data$blame_prescriptive, "-3" = 1, "-2" = 2, "-1" = 3, "0" = 4, "1" = 5, "2" = 6, "3" = 7)
s3_data$praise_prescriptive = recode(s3_data$praise_prescriptive, "-3" = 1, "-2" = 2, "-1" = 3, "0" = 4, "1" = 5, "2" = 6, "3" = 7)
s3k_data$blame_prescriptive = recode(s3k_data$blame_prescriptive, "-3" = 1, "-2" = 2, "-1" = 3, "0" = 4, "1" = 5, "2" = 6, "3" = 7)
s3k_data$praise_prescriptive = recode(s3k_data$praise_prescriptive, "-3" = 1, "-2" = 2, "-1" = 3, "0" = 4, "1" = 5, "2" = 6, "3" = 7)


# split data into dem and rep
s2_dem <- s2_data %>% filter(experiment_id == "e1DXnn")
s2_rep <- s2_data %>% filter(experiment_id == "egNJun")
s3_dem <- s3_data %>% filter(experiment_id == "ew5WPg")
s3_rep <- s3_data %>% filter(experiment_id == "ea8FMd")
s3k_dem <- s3k_data %>% filter(experiment_id == "ewMHzB")
s3k_rep <- s3k_data %>% filter(experiment_id == "eNqCUq")

# get mean of blame_prescriptive and praise_prescriptive for dem and rep
s2_mean_dem <- mean(s2_dem$poster_rating[image_tags_with_raters$partisan == "Democrat"], na.rm = TRUE)






