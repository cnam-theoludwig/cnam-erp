import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

const PORT = Math.trunc(Number(process.env.PORT ?? "4000"))
const HOST = process.env.HOST ?? "0.0.0.0"

export default defineConfig({
  clearScreen: false,

  server: {
    port: PORT,
    strictPort: true,
    host: HOST,
  },

  plugins: [
    devtools(),
    nitro(),
    tanstackStart({
      router: {
        quoteStyle: "double",
        customScaffolding: {
          routeTemplate: [
            "%%tsrImports%%\n\n",
            "interface RouteComponentProps {}\n",
            "const RouteComponent: React.FC<RouteComponentProps> = () => { return <p>%%tsrPath%%</p> }\n\n",
            "%%tsrExportStart%%{\n component: RouteComponent\n }%%tsrExportEnd%%\n\n",
          ].join(""),
        },
      },
    }),
    tailwindcss(),
    react({ compiler: true }),
  ],
})
