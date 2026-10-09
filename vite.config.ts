import { promises as fs } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function meetsApiPlugin(): Plugin {
  return {
    name: 'meets-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/meets' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })

          req.on('end', async () => {
            try {
              const data = JSON.parse(body)
              const filePath = path.resolve(import.meta.dirname, 'src/data/meets.json')
              const jsonContent = JSON.stringify(data, null, 2) + '\n'
              await fs.writeFile(filePath, jsonContent, 'utf-8')

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, message: 'Meets saved successfully' }))
            } catch (error) {
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 500
              res.end(
                JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                }),
              )
            }
          })
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  base: '/MeetMyLove/',
  plugins: [react(), tailwindcss(), meetsApiPlugin()],
})

