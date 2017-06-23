#!/usr/bin/env node
import * as SVGSpriter from 'svg-sprite'

import * as argv from 'argv'
import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import * as colors from 'chalk'
import * as glob from 'glob'

const cwd = process.cwd()

argv.option({
  name: 'icons',
  short: 'i',
  type: 'string',
  description: 'The relative path to the directory containing your SVG icons',
  example: "'packmule --i=./icons' or 'packmule -i ./icons'",
})

argv.option({
  name: 'out',
  short: 'o',
  type: 'string',
  description: 'The relative path to the output directory of the CSS and SVG sprite',
  example: "'packmule --o=./assets/icons' or 'packmule -i ./assets/icons'",
})

const saveGeneratedFiles: SVGSpriter.CompileCallback = (err, result) => {
  if (err) {
    console.warn(err)
    return
  }

  Object.keys(result).forEach(mode => {
    Object.keys(result[mode]).forEach(file => {
      const filePath = result[mode][file].path
      writeFile(filePath, result[mode][file].contents)
        .then((response) => {
          console.log(colors.green('  generated file:'), filePath)
          return response
        })
    })
  })
}

async function run () {
  const args = argv.run()
  const outDir = path.join(cwd, args.options.out)
  const iconsDir: string = path.join(cwd, args.options.icons)
  const typesFilePath = path.join(cwd, `${args.options.out}/icons.d.ts`)

  const files = await getSvgFiles(iconsDir)
  console.log(`Generating svg sprite for ${colors.blue(`${files.length}`)} icons in`, colors.dim(iconsDir))

  await compileIconTypes(typesFilePath, files)

  const spriter = new SVGSpriter({
    dest: outDir,
    shape: {
      spacing: {
        padding: 1,
      },
    },
    mode: {
      css: {
        render: {
          css: true,
        },
      },
      symbol: {
        sprite: 'sprite.svg',
        example: true,
      },
    },
  })

  files.forEach(file => {
    const svgPath = `${iconsDir}/${file}`
    spriter.add(path.resolve(svgPath), file, fs.readFileSync(svgPath).toString())
  })

  spriter.compile(saveGeneratedFiles)
}

function writeFile (filePath: string, content: string) {
  return new Promise((resolve, reject) => {
    mkdirp.sync(path.dirname(filePath))
    fs.writeFile(filePath, content, (err: any, response: any) => {
      if (err) {
        reject(err)
      }
      resolve(response)
    })
  })
}

function getSvgFiles (iconsDir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(`**/*.svg`, { cwd: iconsDir }, (err, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  })
}

function compileIconTypes (typesFilePath: string, files: string[]) {
  const typeDefinition = files
    .map(file => '\'' + file.replace('.svg', '') + '\'')
    .join(' |\n  ')

  const content = `declare namespace Icons {
  type Icon =
  ${typeDefinition}
}
`
  return writeFile(typesFilePath, content)
    .then(() => console.log(colors.green(`Icon types written to:`), colors.green(typesFilePath)))
}

run()