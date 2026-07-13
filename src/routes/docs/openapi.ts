import { Hono } from 'hono'
import {
  API_BASE_URL,
  PALETTE_THEMES,
  PLACEHOLDER_EFFECTS,
  PLACEHOLDER_LIMITS
} from '../../contracts/colors-api'

const app = new Hono()

app.get('/openapi.json', (c) => {
  const spec = {
    "openapi": "3.0.0",
    "info": {
      "title": "colors-cc API",
      "version": "1.0.0",
      "description": "A stateless API for random colors, palettes, and SVG placeholder generation. Built for AI agents and developers.",
      "contact": {
        "url": "https://colors-cc.top"
      }
    },
    "servers": [
      {
        "url": API_BASE_URL,
        "description": "API server"
      }
    ],
    "paths": {
      "/random": {
        "get": {
          "operationId": "getRandomColor",
          "summary": "Get a random HEX and RGB color",
          "description": "Returns a randomly generated color in HEX and RGB formats with a timestamp.",
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "hex": {"type": "string", "example": "#A1B2C3", "description": "6-digit HEX color code"},
                      "rgb": {"type": "string", "example": "rgb(161, 178, 195)", "description": "RGB color format"},
                      "timestamp": {"type": "string", "format": "date-time", "description": "ISO 8601 timestamp"}
                    },
                    "required": ["hex", "rgb", "timestamp"]
                  }
                }
              }
            }
          }
        }
      },
      "/palette": {
        "get": {
          "operationId": "getPalette",
          "summary": "Get a curated color palette",
          "description": "Returns a curated color palette based on the specified theme.",
          "parameters": [
            {
              "name": "theme",
              "in": "query",
              "description": "Theme name for the palette",
              "schema": {
                "type": "string",
                "enum": PALETTE_THEMES,
                "default": "cyberpunk"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Palette with theme and colors",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "theme": {"type": "string", "example": "cyberpunk"},
                      "colors": {"type": "array", "items": {"type": "string"}, "example": ["#FCEE09", "#00FF41", "#00B8FF"]},
                      "count": {"type": "integer", "example": 5}
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/convert": {
        "get": {
          "operationId": "convertColor",
          "summary": "Convert between color formats",
          "description": "Convert a color between HEX, RGB, HSL, and CMYK formats. Provide ONE input parameter.",
          "parameters": [
            {"name": "hex", "in": "query", "description": "HEX color (e.g., %23FF5733 or FF5733)", "schema": {"type": "string"}},
            {"name": "rgb", "in": "query", "description": "RGB color (e.g., rgb(255,87,51))", "schema": {"type": "string"}},
            {"name": "hsl", "in": "query", "description": "HSL color (e.g., hsl(10,100%,60%))", "schema": {"type": "string"}},
            {"name": "cmyk", "in": "query", "description": "CMYK color (e.g., cmyk(0%,65%,80%,0%))", "schema": {"type": "string"}}
          ],
          "responses": {
            "200": {
              "description": "Converted color in all formats",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "hex": {"type": "string", "example": "#FF5733"},
                      "rgb": {"type": "string", "example": "rgb(255, 87, 51)"},
                      "hsl": {"type": "string", "example": "hsl(10, 100%, 60%)"},
                      "cmyk": {"type": "string", "example": "cmyk(0%, 66%, 80%, 0%)"}
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Invalid input or missing parameter",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "error": {"type": "string", "example": "Invalid color format"}
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/all-names": {
        "get": {
          "operationId": "getColorNames",
          "summary": "Get all CSS color names",
          "description": "Returns a mapping of all standard CSS color names to their HEX values.",
          "responses": {
            "200": {
              "description": "Object with color names as keys and HEX codes as values",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "additionalProperties": {"type": "string"},
                    "example": {"AliceBlue": "#F0F8FF", "Tomato": "#FF6347"}
                  }
                }
              }
            }
          }
        }
      },
      "/placeholder": {
        "get": {
          "operationId": "generatePlaceholder",
          "summary": "Generate SVG placeholder image",
          "description": "Creates a dynamic SVG gradient placeholder image with customizable dimensions, text, colors, and visual effects.",
          "parameters": [
            {"name": "w", "in": "query", "description": "Width in pixels", "schema": {"type": "integer", "minimum": PLACEHOLDER_LIMITS.width.min, "maximum": PLACEHOLDER_LIMITS.width.max, "default": PLACEHOLDER_LIMITS.width.default}},
            {"name": "h", "in": "query", "description": "Height in pixels", "schema": {"type": "integer", "minimum": PLACEHOLDER_LIMITS.height.min, "maximum": PLACEHOLDER_LIMITS.height.max, "default": PLACEHOLDER_LIMITS.height.default}},
            {"name": "text", "in": "query", "description": "Center text (defaults to dimensions)", "schema": {"type": "string", "maxLength": PLACEHOLDER_LIMITS.textMaxLength}},
            {"name": "effect", "in": "query", "description": "Visual effect", "schema": {"type": "string", "enum": PLACEHOLDER_EFFECTS, "default": "static"}},
            {"name": "palette", "in": "query", "description": "Comma-separated colors in HEX, RGB, or HSL format (2-10 colors, default: 2 random colors). Example: %23FFD6A5,%23FFADAD", "schema": {"type": "string"}},
            {"name": "speed", "in": "query", "description": "Animation duration in seconds for non-static effects", "schema": {"type": "integer", "minimum": PLACEHOLDER_LIMITS.speed.min, "maximum": PLACEHOLDER_LIMITS.speed.max, "default": PLACEHOLDER_LIMITS.speed.default}},
            {"name": "attribution", "in": "query", "description": "Include branding watermark (default: true). Set to false or 0 to disable", "schema": {"type": "string", "default": "true"}}
          ],
          "responses": {
            "200": {
              "description": "SVG placeholder image",
              "headers": {
                "Cache-Control": {"schema": {"type": "string"}, "description": "public, max-age=31536000, immutable"}
              },
              "content": {"image/svg+xml": {"schema": {"type": "string", "format": "binary"}}}
            },
            "400": {
              "description": "Invalid dimensions, palette, effect, speed, or text parameter"
            }
          }
        }
      },
      "/fluid-placeholder": {
        "get": {
          "operationId": "generateFluidPlaceholder",
          "summary": "Generate animated fluid SVG placeholder",
          "description": "Alias for /placeholder?effect=fluid. Creates a dynamic SVG gradient with smooth, infinitely-looping color transitions.",
          "parameters": [
            {"name": "w", "in": "query", "description": "Width in pixels", "schema": {"type": "integer", "minimum": PLACEHOLDER_LIMITS.width.min, "maximum": PLACEHOLDER_LIMITS.width.max, "default": PLACEHOLDER_LIMITS.width.default}},
            {"name": "h", "in": "query", "description": "Height in pixels", "schema": {"type": "integer", "minimum": PLACEHOLDER_LIMITS.height.min, "maximum": PLACEHOLDER_LIMITS.height.max, "default": PLACEHOLDER_LIMITS.height.default}},
            {"name": "palette", "in": "query", "description": "Comma-separated colors in HEX, RGB, or HSL format (2-10 colors, default: 2 random colors). Example: %23FFD6A5,%23FFADAD", "schema": {"type": "string"}},
            {"name": "speed", "in": "query", "description": "Animation duration in seconds", "schema": {"type": "integer", "minimum": PLACEHOLDER_LIMITS.speed.min, "maximum": PLACEHOLDER_LIMITS.speed.max, "default": PLACEHOLDER_LIMITS.speed.default}},
            {"name": "text", "in": "query", "description": "Optional center text", "schema": {"type": "string", "maxLength": PLACEHOLDER_LIMITS.textMaxLength}},
            {"name": "attribution", "in": "query", "description": "Include branding watermark (default: true). Set to false or 0 to disable", "schema": {"type": "string", "default": "true"}}
          ],
          "responses": {
            "200": {
              "description": "Animated SVG placeholder image",
              "headers": {
                "Cache-Control": {"schema": {"type": "string"}, "description": "public, max-age=31536000, immutable"}
              },
              "content": {"image/svg+xml": {"schema": {"type": "string", "format": "binary"}}}
            },
            "400": {
              "description": "Invalid dimensions, palette, speed, or text parameter"
            }
          }
        }
      }
    }
  }
  c.header('Cache-Control', 'public, max-age=86400')
  return c.json(spec)
})

export default app
