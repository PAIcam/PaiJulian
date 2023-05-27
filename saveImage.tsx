import * as MediaLibrary from 'expo-media-library';

export async function saveImage(fileUri: string) {
      
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.status != 'granted') {
      console.log("Permission not Granted!")
      return;
    }
    
    // Save to DCIM folder
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    
    try {
      const album = await MediaLibrary.getAlbumAsync('polinators');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('polinators', asset, true);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, true)
          .then(() => {
            console.log('File Saved Successfully!');
          })
          .catch((err: string) => {
            console.log('Error In Saving File!', err);
          });
      }
    } catch (e) {
      console.log(e);
    }
  
  }