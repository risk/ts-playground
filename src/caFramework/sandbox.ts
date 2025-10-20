/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

type CanDepend<L extends Layer, I extends readonly Layer[]> =
    L extends I[number]
    ? true 
    : false extends true // この出し方、AIさんに教えてもろた
      ? never 
      : `Error: Layer ${L} cannot depend on this interface`

const LayerLevels = {
  FrameworksDrivers: 'FrameworksDrivers',
  InterfaceAdapter: 'InterfaceAdapter',
  ApplicationBuisinessRule: 'ApplicationBuisinessRule',
  EnterpriseBuisinessRule: 'EnterpriseBuisinessRule',
  Uknown: 'Unknown'
} as const

type Layer = keyof typeof LayerLevels

interface InterfacePolicy<Layers extends readonly Layer[]> {
  readonly usable: Layers
}

interface UsecaseInPort extends InterfacePolicy<[
  'InterfaceAdapter',
  'FrameworksDrivers'
]> {
  condition: {
    id: number
  }
}

interface UsecaseInPort_Err extends InterfacePolicy<[
  // 'InterfaceAdapter', // わざと、InterfaceAdapterに使わせないようにする
  'FrameworksDrivers'
]> {
  condition: {
    id: number
  }
}

interface ControllerInPort extends InterfacePolicy<[
  'FrameworksDrivers',
  'InterfaceAdapter']
> {
  id: number
}

interface LayerPolicy<
    Level extends Layer,
    I extends InterfacePolicy<readonly Layer[]>,
    O extends InterfacePolicy<readonly Layer[]>> {
  ICheck: CanDepend<Level, I['usable']>
  OCheck: CanDepend<Level, O['usable']>
  exeute(input: I): O
}

class LayerBase {
  declare ICheck: true
  declare OCheck: true
}

interface MyControllerPolicy extends
    LayerPolicy<'InterfaceAdapter', ControllerInPort, UsecaseInPort> {}

class MyController extends LayerBase implements MyControllerPolicy {

  exeute(input: ControllerInPort): UsecaseInPort {
    throw new Error("Method not implemented.")
  }
}
const c = new MyController()

interface MyControllerPolicy_Err extends
    LayerPolicy<'InterfaceAdapter', ControllerInPort, UsecaseInPort_Err> {}

class MyController_Err extends LayerBase implements MyControllerPolicy_Err {

  exeute(input: ControllerInPort): UsecaseInPort_Err {
    throw new Error("Method not implemented.")
  }
}
const c_err = new MyController_Err()

