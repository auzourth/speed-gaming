'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

export async function getOrderByCode(code: string) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        code,
      },
      include: {
        user: true,
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return { success: false, error: 'Failed to fetch order' };
  }
}

export async function createOrder(data: {
  code: string;
  orderId?: string;
  email?: string;
  name?: string;
  userId?: string;
}) {
  try {
    const { code, orderId, email, name, userId } = data;

    // Create the order
    const order = await prisma.order.create({
      data: {
        code,
        orderId,
        email,
        name,
        userId,
      },
    });

    revalidatePath('/admin/dashboard');
    return { success: true, data: order };
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  loginInfo?: string
) {
  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
        loginInfo,
      },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath(`/track-order/${updatedOrder.code}`);

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error('Failed to update order:', error);
    return { success: false, error: 'Failed to update order' };
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: {
        id,
      },
    });

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}

export async function generateRedemptionCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Check if code already exists
  const existingOrder = await prisma.order.findUnique({
    where: {
      code: result,
    },
  });

  // If code exists, generate a new one recursively
  if (existingOrder) {
    return generateRedemptionCode();
  }

  return result;
}
