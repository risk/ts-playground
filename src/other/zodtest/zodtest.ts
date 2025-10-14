import z from 'zod'

const schema = z.object({
  s: z.string().default('default_string'),
  n: z.number()
})

console.log(schema.safeParse({
  // s: 'string',
  n: 123
}))


// const schema = z.literal('literal_test')
// console.log(schema.safeParse('literal_test'))
// console.log(schema.safeParse('literal_tes'))
// console.log(schema.safeParse('literal_test1'))

// // Helper function
// function toZodEnumType<T>(arr: Array<T>): readonly [T, ...T[]] {
//   if(arr.length < 1) {
//     throw Error('Format check value is invalid')
//   }
//   return [arr[0], ...arr.slice(1)]
// }

// // 定数定義
// const Commands = {
//   aaa: 'a_a_a',
//   bbb: 'b_b_b_b',
//   ccc: 'c_c'
// } as const
// const commandValues = Object.values<string>(Commands)

// const CommandSchema = z.enum(toZodEnumType(commandValues))

// type connamd = typeof Commands[keyof typeof Commands]

// const c1: connamd = 'a_a_a'
// const c2: connamd = Commands.aaa
// // const c3: connamd = 'd_d_d'

// const parse = (s: any) => {
//   const parsed = CommandSchema.safeParse(s)
//   if(parsed.success) {
//     console.log(parsed)
//   } else {
//     console.log('error', parsed.error.message)
//   }
// }

// parse(Commands.aaa)
// parse(Commands.bbb)
// parse(Commands.ccc)

// parse('a_a_a')
// parse('b_b_b_b')
// parse('c_c')

// parse('a_a')
// parse('b_b_b_b_b')
// parse('c')

// parse(1)
// parse(2)
// parse(3)
