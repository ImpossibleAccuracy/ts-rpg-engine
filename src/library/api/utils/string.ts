function formatString(source: string, data: any) {
  let result = source.toString();

  if (data.length) {
    for (let key in data) {
      result = result.replace(new RegExp("\\{" + key + "\\}", "gi"), data[key]);
    }
  }

  return result;
}
