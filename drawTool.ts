const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class Canvas {
  private height: number;
  private width: number;
  private specs: string[][];

  constructor(width: number, height: number) {
    this.createCanvas(width, height);
  }

  isValidNumber(num: any): boolean {
    return typeof num === 'number' && num > 0;
  }

  isValidX(num: any): boolean {
    return this.isValidNumber(num) && num <= this.width;
  }

  isValidY(num: any): boolean {
    return this.isValidNumber(num) && num <= this.height;
  }

  createCanvas (width: number, height: number): void {

    this.width = width;
    this.height = height;

    if (!this.isValidNumber(width) || !this.isValidNumber(height)) {
      throw new Error('Height and width must both be numbers greater than zero.');
    }

    this.specs = this.constructArray(height + 2, '').map((element, index) => {
      if (index === 0 || index === height + 1) {
        return this.constructArray(width + 2, '-')
      } else {
        const oneLineArray = this.constructArray(width, ' ');
        oneLineArray.unshift('|');
        oneLineArray.push('|');
        return oneLineArray;
      }
    });
  }

  constructArray (length: number, content: string): string[] {
    const result = [];
    for (let i = length; i > 0; i--) {
      result.push(content);
    }
    return result;
  }

  createLine (x1: number, y1: number, x2: number, y2: number): void {

    if (!this.isValidX(x1) || !this.isValidX(x2)) {
      throw new Error('X coordinates must be positive integers that fall within the canvas.');
    }

    if (!this.isValidY(y1) || !this.isValidY(y2)) {
      throw new Error('Y coordinates must be positive integers that fall within the canvas.');
    }

    if ((x1 === x2) && (y1 === y2)) {
      throw new Error('Line cannot begin and end at the same location.');
    }

    if (x1 === x2) {
      let top = Math.min(y1, y2);
      let bottom = Math.max(y1, y2);
      for (let i = top; i <= bottom; i++) {
        this.specs[i][x1] = 'x';
      }
    } else if (y1 === y2) {
      let left = Math.min(x1, x2);
      let right = Math.max(x1, x2);
      for (let i = left; i <= right; i++) {
        this.specs[y1][i] = 'x';
      }
    } else {
      throw new Error('Can only draw a straight line.');
    }
  }

  createRectangle(x1: number, y1: number, x2: number, y2: number) {

    if (x1 === x2 || y1 === y2) {
      throw new Error('Cannot make a rectangle from a straight line.');
    }

    this.createLine(x1, y1, x2, y1);
    this.createLine(x1, y2, x2, y2);
    this.createLine(x1, y1, x1, y2);
    this.createLine(x2, y1, x2, y2);
  }

  bucketFill(x: number, y: number, c: string): void {

    if (!this.isValidX(x) || !this.isValidY(y)) {
      throw new Error('X-Y coordinate must be positive integers that fall within the canvas.');
    }

    if (!c || c.length > 1) {
      throw new Error('The color must be a single character.');
    }

    if (this.specs[y][x] !== ' ') {
      return;
    } else {
      this.specs[y][x] = c;
      if (x > 1) {this.bucketFill(x-1, y, c);}
      if (y > 1) {this.bucketFill(x, y-1, c);}
      if (x < this.width) {this.bucketFill(x+1, y, c);}
      if (y < this.height) {this.bucketFill(x, y+1, c);}
    }
  }

  print2DArray(): string {
    let printResult = '';
    this.specs.forEach((line) => {
      line.forEach((column) => {
        printResult += column;
      })
      printResult += '\n';
    })
    return printResult;
  }
}

async function main () {
  
  const file = await readFileAsync('./input.txt', 'utf8');
  const arrayOfCommands = file.split('\n');
  let output = '';
  let canvas: Canvas;
  arrayOfCommands.forEach((line: string, index: number) => {
    const arrayOfCurrentLine = line.split(' ');

    if (index === 0 && arrayOfCurrentLine[0] !== 'C') {
      throw new Error('Invalid input: Canvas must be initialized first.');
    }

    if (index !== 0 && arrayOfCurrentLine[0] === 'C') {
      throw new Error('Invalid input: Canvas cannot be initialized more than once.');
    }

    switch (arrayOfCurrentLine[0]) {
      case 'C': {
        canvas = new Canvas(Number(arrayOfCurrentLine[1]), Number(arrayOfCurrentLine[2]));
        break;
      }
      case 'L': {
        canvas.createLine(Number(arrayOfCurrentLine[1]), Number(arrayOfCurrentLine[2]), Number(arrayOfCurrentLine[3]), Number(arrayOfCurrentLine[4]));
        break;
      }
      case 'R': {
        canvas.createRectangle(Number(arrayOfCurrentLine[1]), Number(arrayOfCurrentLine[2]), Number(arrayOfCurrentLine[3]), Number(arrayOfCurrentLine[4]));
        break;
      }
      case 'B': {
        canvas.bucketFill(Number(arrayOfCurrentLine[1]), Number(arrayOfCurrentLine[2]),arrayOfCurrentLine[3]);
        break;
      }
      default: {
        throw new Error('Invalid command entered. Must begin with C, L, R, or B.');
      }
    }
    output += canvas.print2DArray();
  });

  await writeFileAsync('./output.txt', output);
}

main();