// CLOUD MASKING SCL
function maskS2Cloud(image) {
  var scl = image.select('SCL');
  return image.updateMask(
    scl.neq(3)   
      .and(scl.neq(7))  
      .and(scl.neq(8))  
      .and(scl.neq(9))  
      .and(scl.neq(10)) 
      .and(scl.neq(11)) 
  );
}


// IMPORT CITRA SENTINEL-2
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(geometry)
  .filterDate('2024-01-01', '2025-12-22')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskS2Cloud)
  .median()
  .clip(geometry)
  .divide(10000);


// VARIABEL BAND
var nir = s2.select('B8');
var red = s2.select('B4');
var blue = s2.select('B2');


// PERHITUNGAN EVI
var EVI = nir.subtract(red)
  .divide(
    nir.add(red.multiply(6.0))
      .subtract(blue.multiply(7.5))
      .add(1.0)
  )
  .multiply(2.5)
  .rename('EVI');


// VISUALISASI
var visParam = {
  min: -0.0,
  max: 0.83,
  palette: ['#d73027','#fdae61','#fee08b','#d9ef8b','#66bd63','#1a9850']
};

Map.addLayer(EVI, visParam, 'EVI Index');
Map.centerObject(geometry, 13);


// EXPORT EVI KE GOOGLE DRIVE
Export.image.toDrive({
  image: EVI,
  description: 'EVI_Sentinel2_2024_2025',
  folder: 'GEE_Output',
  fileNamePrefix: 'EVI_S2_2024_2025',
  region: geometry,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});
