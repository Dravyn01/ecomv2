export const renameFile = (filename: string) => {
  const ext = filename.split('.').at(-1);
  const newFilename = Math.random().toString(36).substring(2);
  return `${newFilename}.${ext}`;
};
