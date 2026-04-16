import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    message:
      "Endpoint placeholder para disparo de notificações. Liga um cron à verificação de alertas activos e envia browser push ou e-mail."
  });
}
