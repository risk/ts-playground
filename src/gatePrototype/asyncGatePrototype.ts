/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

import { z } from "zod";

const GateErrorTypes = {
  InputFormatError: 'InputFormatError',
  OutputFormatError: 'OutputFormatError',
} as const
type GateErrorType = typeof GateErrorTypes[keyof typeof GateErrorTypes]

class GateError extends Error {
  public constructor(
      private type: GateErrorType,
      message?: string
      ) {
    super(message);
  }

  toString(): string {
    return `[${this.type}] ${this.message}`
  }
}

// 同じスキーマで、違うハンドラ仕込みたい時用にカリー化
function makeAsyncGate<I, O>(inSchema: z.ZodType<I>, outSchema: z.ZodType<O>) {
  if (inSchema instanceof z.ZodPromise || outSchema instanceof z.ZodPromise) {
    throw new Error('AsyncGate schema must not include z.promise() — use async handler instead.')
  }
  return (fn: (input: I) => O | Error | Promise<O | Error>) => {
    return async (input: unknown): Promise<O | Error> => {

      // 入力データのフォーマットチェック
      const parsedInput = inSchema.safeParse(input)
      if(!parsedInput.success) {
        return new GateError(GateErrorTypes.InputFormatError, parsedInput.error.toString())
      }

      // ハンドラ呼び出し
      const rawResult = await Promise.resolve(fn(parsedInput.data))

      // ハンドラがErrorを返した場合は、そのままreturn
      if(rawResult instanceof Error) {
        return rawResult
      }

      // 出力データのフォーマットチェック
      const parsedOutput = outSchema.safeParse(rawResult)
      if(!parsedOutput.success) {
        return new GateError(GateErrorTypes.OutputFormatError, parsedOutput.error.toString())
      }

      return parsedOutput.data
    }
  }
}

// プリミティブ
async function basicSchemaAsync() {
  const inputSchema = z.number()
  const outputSchema = z.string()

  // Make gate handler
  const gateHandler= makeAsyncGate(inputSchema, outputSchema)(input => input.toString())

  // Success
  console.log('success', await gateHandler(1))

  // Error
  console.log('error', await gateHandler('string'))
  console.log('error', await gateHandler(true))
}

// オブジェクト
async function objectSchemaAsync() {
  const inputSchema = z.object({
    n: z.number(),
    s: z.string()
  }).strict()
  const outputSchema = z.object({
    ok: z.boolean(),
    message: z.string()
  }).strict()
  // strictは、余計なものを入れさせない。handlerの中は許可したもののみの世界

  // Make gate handler
  const gateHandler= makeAsyncGate(inputSchema, outputSchema)(input => {

    // フォーマットエラーを発生させる仕組み
    // Schemaはparseを通すまで、増えたものを認識出来ない
    // なので、出してはいけないデータは、実行時判定に委ねる
    if(input.n === 1000) {
      return {
        ok: false,
        message: `message: ${input.s}`,
        more: true
      }
    }
    
    // 通常のデータは、普通に返す
    return {
      ok: input.n < 10,
      message: `message: ${input.s}`
    }
  })

  // Format Success
  console.log('success', await gateHandler({ n: 1, s: 'value is 1' }))
  console.log('success', await gateHandler({ n: 100, s: 'value is 100' }))

  // Format Error
  console.log('error', await gateHandler({ n: 1, /*s: 'value is 1'*/ })) // less
  console.log('error', await gateHandler({ n: 1, s: 'value is 1', more: true })) // more
  console.log('error', await gateHandler({ n: 1000, s: 'value is 1' })) // output data is　more prameter
}

// エラー
async function returnErrorAsync() {
  const inputSchema = z.number()
  const outputSchema = z.string()

  // Make gate handler
  const gateHandler= makeAsyncGate(inputSchema, outputSchema)(input => new Error('test error'))

  // Handler return error
  console.log('error', await gateHandler(1))
}

async function main() {
  await basicSchemaAsync()
  await objectSchemaAsync()
  await returnErrorAsync()
}
main()
