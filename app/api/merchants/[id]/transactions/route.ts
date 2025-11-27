import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ApiResponse } from "@/lib/api-client";
import { getMerchantTransactions } from "@/app/admin/merchants/[id]/_actions/getMerchantTransactions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userRole = session.user.role?.toLowerCase();
    if (userRole !== "admin" && userRole !== "superadmin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Forbidden",
        },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status") || "all";

    const result = await getMerchantTransactions({
      merchantId: id,
      page,
      limit,
      status,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

