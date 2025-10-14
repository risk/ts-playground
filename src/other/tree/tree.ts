interface Converter {
  beAbleToConvert(tag: string): boolean
  convert(tree: any): void
}

class DefaultConverter {
  beAbleToConvert(tag: string) {
    return true
  }
  convert(tree: any) {
    tree.htmlTag = tree.tag
  }
}

class DivConverter {
  beAbleToConvert(tag: string) {
    return tag === 'div'
  }
  convert(tree: any) {
    tree.htmlTag = 'div'
  }
}

class CoR {
  converters: Converter[] = [
    new DivConverter(),
    new DefaultConverter()
  ]

  execute(tree: any) {
    for(const converter of this.converters) {
      if(converter.beAbleToConvert(tree.tag)) {
        converter.convert(tree)
        return
      }
    }
  }
}

function converter(root: any){
  const cor = new CoR()
  const recursive = (tree: any) => {
    cor.execute(tree)
    tree.children?.forEach((child: any) => {
      recursive(child)
    })
  }
  recursive(root)
  return root
}


console.log(converter({
  type: 'tag',
  tag: 'div',
  children: [
    {
      type: 'contents',
      contents: 'これはテキストです'
    },
    {
      type: 'tag',
      tag: 'p',
      children: [
        {
          type: 'contents',
          contents: 'pのテキストです'
        }
      ]
    }
  ]
}))