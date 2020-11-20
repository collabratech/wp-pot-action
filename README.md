<img src="https://user-images.githubusercontent.com/8137207/42288219-38fa5500-7f90-11e8-931b-ebe65f000c77.png" alt="Collabra Tecnology" style="width: 300px;"/>

# collabratech/wp-pot-action

<p>
  <a href="https://github.com/actions/javascript-action/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
</p>

Generates `.pot` files for WordPress themes and plugins.<br />
This action uses the [wp-pot](https://github.com/wp-pot/wp-pot) npm package behind the scenes.

## Usage

To use this action, simply provide the `.pot` file destination and the text-domain.

```yml
steps:
- uses: actions/checkout@v2
- uses: collabratech/wp-pot-action@v1
  with:
    destination: 'languages/my-theme.pot'
    text-domain: 'my-theme'
```

If you want to run the action on the `pull_request` event, you will need to set the checkout action `ref` as `head_ref` to commit on the branch that originated the pull request.

```yml
generate-pot:
  runs-on: ubuntu-latest
  steps:
  - uses: actions/checkout@v2
    with:
      ref: ${{ github.head_ref }}
  - uses: collabratech/wp-pot-action@v1
    with:
      destination: 'test/test-action.pot'
      text-domain: 'test-action'
```

By default this action looks for any `.php` files in your repository, but you can set a custom `source` path to scan.

```yml
steps:
- uses: actions/checkout@v2
- uses: collabratech/wp-pot-action@v1
  with:
    source: 'src/**/*.php'
    destination: 'src/languages/my-theme.pot'
    text-domain: 'my-theme'
```

## Inputs

### `text-domain`

**Required** The text-domain of your theme or plugin.

### `destination`

**Required** The path and filename of the generated `.pot` file.

### `source`

**Optional** The source to scan php files. Default `"**/*.php"`.

## Contributing

Contributions are welcome! Check out the Contribution Guide (soon).

## License

The code in this project is released under the [MIT License](LICENSE).
