declare module '*.yaml' {
  const content: any;
  export default content;
}

declare module '*.yml' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}
