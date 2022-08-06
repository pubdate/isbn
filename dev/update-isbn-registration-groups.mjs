import { FormData } from 'formdata-polyfill/esm.min.js'
import { execSync } from 'child_process'
import fetch from 'node-fetch'
import isbnRegistrationGroupDataByAgency from './isbn-registration-group-data-by-agency.mjs'
import { parseStringPromise } from 'xml2js'
import { writeFileSync } from 'fs'

;(async () => {
  const body = new FormData()
  body.append('format', 1)
  body.append('language', 'en')
  body.append('translatedTexts', 'Printed;Last Change')
  const rangeInformations = await fetch('https://www.isbn-international.org/bl_proxy/GetRangeInformations', { method: 'POST', body })
    .then(x => x.json())

  const rangeMessage = await fetch(`https://www.isbn-international.org/download_range/${rangeInformations.result.value}/${rangeInformations.result.filename}`)
    .then(x => x.text())
    .then(parseStringPromise)

  const items = rangeMessage.ISBNRangeMessage.RegistrationGroups[0].Group.map(group => {
    const _ = {}
    group.Rules[0].Rule.forEach(rule => {
      if (rule.Length[0] === '0') return
      if (_[rule.Length[0]] == null) _[rule.Length[0]] = []
      _[rule.Length[0]].push(rule.Range[0].split('-').map(x => parseInt(x.slice(0, rule.Length[0]))))
    })
    return {
      ...isbnRegistrationGroupDataByAgency[group.Agency[0]],
      eanPrefix: group.Prefix[0].split('-')[0],
      codePrefix: group.Prefix[0].split('-')[1],
      _
    }
  })

  const tree = {}
  items.forEach(group => {
    const { eanPrefix, codePrefix, ...g } = group
    let node = tree[group.eanPrefix] ?? (tree[group.eanPrefix] = {})
    group.codePrefix.split('').forEach((char, i) => { node = node[char] ?? (node[char] = (i === group.codePrefix.length - 1 ? g : {})) })
  })

  writeFileSync('./src/index.ts', `/* eslint comma-dangle: ["error", "always-multiline"] */

    import IsbnWithoutRegistrationGroups from './isbn-without-registration-groups'

    export default class ISBN extends IsbnWithoutRegistrationGroups {
      static REGISTRATION_GROUPS_TREE_BY_EAN_PREFIX: (typeof IsbnWithoutRegistrationGroups)['REGISTRATION_GROUPS_TREE_BY_EAN_PREFIX'] = ${
        JSON.stringify(tree, null, 2).replace(/"\d": {\n\s*"[a-z_]": (?:[^{}]|\{[^{}]*\})+}/g, match => match.replace(/\s+/g, ' '))
      }
    }
  `)

  execSync('./node_modules/.bin/eslint src/index.ts --fix')
})()
