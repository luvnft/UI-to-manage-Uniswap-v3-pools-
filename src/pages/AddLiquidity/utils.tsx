import JSBI from "jsbi";
import { Pool, Position } from "@uniswap/v3-sdk";
import { Token, MaxUint256, WETH9 } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";

export function positionFromAmounts(
  {
    pool,
    tickLower,
    tickUpper,
    val0,
    val1,
  }: {
    pool: Pool;
    tickLower: number;
    tickUpper: number;
    val0: number;
    val1: number;
  },
  reverse: boolean
): Position {
  if (reverse) {
    [tickLower, tickUpper] = [tickUpper, tickLower];
    [val0, val1] = [val1, val0];
  }

  const amount0 =
    val0 === 0
      ? MaxUint256
      : JSBI.BigInt(val0 * Math.pow(10, pool.token0.decimals));

  const amount1 =
    val1 === 0
      ? MaxUint256
      : JSBI.BigInt(val1 * Math.pow(10, pool.token1.decimals));

  return Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    useFullPrecision: false,
  });
}

export function calculateNewAmounts(
  {
    pool,
    tickLower,
    tickUpper,
    val0,
    val1,
  }: {
    pool: Pool;
    tickLower: number;
    tickUpper: number;
    val0: number;
    val1: number;
  },
  reverse: boolean
): [number, number] {
  const pos = positionFromAmounts(
    { pool, tickLower, tickUpper, val0, val1 },
    reverse
  );

  let newVal0 = parseFloat(pos.amount0.toSignificant(16));
  let newVal1 = parseFloat(pos.amount1.toSignificant(16));

  if (reverse) {
    [newVal0, newVal1] = [newVal1, newVal0];
  }

  return [newVal0, newVal1];
}

export function positionDistance(
  tickCurrent: number,
  position: { entity: Position }
) {
  const { tickLower, tickUpper } = position.entity;
  return tickCurrent - (tickUpper - tickLower) / 2;
}

export function tokenAmountNeedApproval(
  chainId: number,
  token: Token,
  allowance: BigNumber,
  amount: BigNumber
): boolean {
  if (!token || !chainId) {
    return false;
  }

  if (token.equals(WETH9[chainId])) {
    return false;
  }
  return allowance.lt(amount);
}
