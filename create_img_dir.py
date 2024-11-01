import pandas as pd
import os
import shutil

df = pd.read_csv('stim_images_v2_covariate_sheet_political.csv')

source_dir = 'public/img/stim_set_control_pol_600'
dem_dir = 'public/img/dem'
rep_dir = 'public/img/rep'

os.makedirs(dem_dir, exist_ok=True)
os.makedirs(rep_dir, exist_ok=True)

# copy files to directories
for _, row in df.iterrows():
    filename = row['filename']
    partisan = row['partisan']
    source_path = os.path.join(source_dir, filename)
    
    # copy to dem if dem or neutral
    if partisan in ['Democrat', 'N/A']:
        dest_path = os.path.join(dem_dir, filename)
        shutil.copy2(source_path, dest_path)
    
    # copy to rep if rep or neutral
    if partisan in ['Republican', 'N/A']:
        dest_path = os.path.join(rep_dir, filename)
        shutil.copy2(source_path, dest_path)

print("Image sorting complete")