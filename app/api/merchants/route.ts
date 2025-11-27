import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ApiResponse } from "@/lib/api-client";
import { getMerchants } from "@/app/admin/merchants/_actions/getMerchants";
import { createMerchant } from "@/app/admin/merchants/new/_actions/createMerchant";

export async function GET(request: NextRequest) {
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
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const result = await getMerchants({
      page,
      limit,
      search,
      status: status as "active" | "inactive" | "all",
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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const result = await createMerchant(body);

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: result.error || "Failed to create merchant",
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.merchant,
    });
  } catch (error) {
    console.error("Error creating merchant:", error);
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
