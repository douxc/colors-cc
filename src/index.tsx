import { createApp } from './app'
import imageCompressTemplate from './pages/image-compress.html'
import { globalSiteConfig } from './site'
import homeTemplate from './templates/home.html'

export default createApp(globalSiteConfig, {
  home: homeTemplate,
  imageCompress: imageCompressTemplate
})
