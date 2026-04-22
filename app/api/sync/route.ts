import { NextResponse } from "next/server";
import { syncOrdersToSupabase } from "@/lib/sync-utils";

export async function POST() {
  const success = await syncOrdersToSupabase();

  return NextResponse.json(
    { success },
    { status: success ? 200 : 500 },
  );
}
