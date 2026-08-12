import { createApp } from './app'
import { globalSiteConfig } from './site'
import homeTemplate from './templates/home.html'

export default createApp(globalSiteConfig, {
  home: homeTemplate
})
