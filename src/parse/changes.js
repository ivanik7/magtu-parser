import cp from "../lib/cellPos";

const parseString = string => {
  const split = string.split("  ");
  try {
    if (string.indexOf("-----") !== -1) {
      return {
        removed: true
      };
    }
    return {
      name: split[0],
      teacher: split[1].split("\r\n")[1],
      classroom: split[1].split("\r\n")[0]
    };
  } catch (e) {
    console.log("Error in changes for", string);
    return {};
  }
};

const splitString = (string, number) => {
  if (string.indexOf("1. ") === -1 && string.indexOf("2. ") === -1) {
    return [
      {
        number,
        subgroup: "common",
        ...parseString(string)
      }
    ];
  }
  if (string.split("\r\n2. ").length > 1) {
    return [
      {
        number,
        subgroup: "first",
        ...parseString(string.replace("1. ", "").split("\r\n2. ")[0])
      },
      {
        number,
        subgroup: "second",
        ...parseString(string.replace("1. ", "").split("\r\n2. ")[1])
      }
    ];
  }
  if (string.indexOf("1. ") !== -1) {
    return [
      {
        number,
        subgroup: "first",
        ...parseString(string.replace("1. ", ""))
      }
    ];
  }
  if (string.indexOf("2. ") !== -1) {
    return [
      {
        number,
        subgroup: "second",
        ...parseString(string.replace("2. ", ""))
      }
    ];
  }
  return [];
};

const processCol = (sheet, x, y, pairsCount) => {
  const three = {};
  for (let t = 0; t < 3; t += 1) {
    three[t] = [];
    for (let p = 1; p <= pairsCount[t]; p += 1) {
      if (sheet[cp(x, y + p + (pairsCount[t] + 1) * t)]) {
        const pairs = splitString(
          sheet[cp(x, y + p + (pairsCount[t] + 1) * t)].v,
          p
        );
        three[t].push(...pairs);
      }
    }
  }
  return { group: sheet[cp(x, y)].v.toLowerCase().split("/")[0], three };
};

const findCols = (sheet, pairsCount, y = 2) => {
  const cols = [];
  let empty = 0;
  for (let col = 1; col < 300; col += 1) {
    if (sheet[cp(col, y)]) {
      empty = 0;
      cols.push(processCol(sheet, col, y, pairsCount));
    } else {
      empty += 1;
      if (empty > 6) {
        return cols;
      }
    }
  }
  return cols;
};

const findPairsCount = (sheet, x = 3, y = 3) => {
  const pairs = [];
  for (let three = 0; three < 3; three += 1) {
    for (let row = y; row < y + 12; row += 1) {
      if (sheet[cp(x, row)]) {
        pairs[three] = sheet[cp(x, row)].v;
      } else {
        break;
      }
    }
  }

  return pairs;
};

export default book => {
  const sheet = book.Sheets[book.SheetNames[0]];

  return findCols(sheet, findPairsCount(sheet));
};

/*
{
  "испк-18-1": {
    "0": [{
      number: 1,
      name: "Физкультура",
      teacher: "Петровска С. С.",
      classroom: "Н404",
      subgroup: "common",
    }],
    1: []
    2: []
  }
}
*/