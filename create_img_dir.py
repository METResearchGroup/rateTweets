import os
import shutil
from pathlib import Path

def get_image_names(folder_path):
    return {f.name for f in Path(folder_path).glob('*.png')}

def setup_directories(dem, rep):
    for directory in [dem, rep]:
        os.makedirs(directory, exist_ok=True)

def main():
    base_dir = Path('.')
    full_700_dir = base_dir / 'public/img/full_700'
    dem_output = base_dir / 'public/img/dem'
    rep_output = base_dir / 'public/img/rep'

    # create output directories
    setup_directories(dem_output, rep_output)

    # debug prints to verify paths and image counts
    print("\nChecking source directories:")
    rep_dwell = get_image_names('public/img/stim_set_top_100_dwell_rep')
    print(f"Rep dwell images: {len(rep_dwell)}")
    
    rep_like_share = get_image_names('public/img/stim_set_top_100_like_share_rep')
    print(f"Rep like/share images: {len(rep_like_share)}")
    
    dem_dwell = get_image_names('public/img/stim_set_top_100_dwell_dem')
    print(f"Dem dwell images: {len(dem_dwell)}")
    
    dem_like_share = get_image_names('public/img/stim_set_top_100_like_share_dem')
    print(f"Dem like/share images: {len(dem_like_share)}")

    # combine rep and dem images
    # removes duplicates that exist in both dem or rep sets
    all_rep_images = rep_dwell | rep_like_share
    all_dem_images = dem_dwell | dem_like_share

    # get all images from full_700
    all_images = get_image_names('public/img/full_700')
    print(f"\nTotal images in full_700: {len(all_images)}")

    # remove images (but not images in both dem and rep folders)
    dem_folder_images = all_images - (all_rep_images - all_dem_images)  # remove only rep-exclusive images
    rep_folder_images = all_images - (all_dem_images - all_rep_images)  # remove only dem-exclusive images

    # copy images to appropriate folders
    for img_name in dem_folder_images:
        shutil.copy2(full_700_dir / img_name, dem_output / img_name)

    for img_name in rep_folder_images:
        shutil.copy2(full_700_dir / img_name, rep_output / img_name)

    # print summary
    print(f"Copied {len(dem_folder_images)} images to dem")
    print(f"Copied {len(rep_folder_images)} images to rep")

if __name__ == "__main__":
    main()

# excluding images that are in both dem and rep folders: 519 dem, 529 rep
# including images that are in both dem and rep folders: 560 dem, 570 rep