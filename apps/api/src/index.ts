import 'dotenv/config'
import { buildApp } from './app'

const app  = buildApp()
const PORT = parseInt(process.env.PORT ?? '4000')

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`\n🚀  TroveJob API running on http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health\n`)
})
