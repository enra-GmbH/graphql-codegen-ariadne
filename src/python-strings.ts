export function callable({ argumentTypes, retVal }: {
    argumentTypes: string[],
    retVal: string
}): string {

  return `Callable[[${argumentTypes.join(', ')}], ${retVal}]`
}

export function union(...types: string[]): string {
  return `Union[${types.join(', ')}]`;
}