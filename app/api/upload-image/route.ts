import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `produtos/${fileName}`

    console.log("[v0] Fazendo upload da imagem:", fileName)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file)

    if (uploadError) {
      console.error("[v0] Erro no upload:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath)

    console.log("[v0] Upload concluído, URL:", publicUrl)

    return NextResponse.json({ url: publicUrl })
  } catch (error: any) {
    console.error("[v0] Erro inesperado no upload:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
