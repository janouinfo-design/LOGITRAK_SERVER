
const babel = require('@rollup/plugin-babel')
const { default: commonjs } = require('@rollup/plugin-commonjs')
const { default: json } = require('@rollup/plugin-json')
const terser = require('@rollup/plugin-terser')
const command = require('rollup-plugin-command')
const copy = require('rollup-plugin-copy')
const { nodeResolve } = require('@rollup/plugin-node-resolve') ;
// const client_build = [
//     "cd client && npm install && npm run build && cd.."
// ]

const copyTargets = [
    {
        src: 'package.json',
        dest: 'release'
    },
    {
        src: '.env',
        dest: 'release'
    },
    {
        src: '*.bat',
        dest: 'release'
    },
    {
        src: 'web.config',
        dest: 'release'
    }
]

const pkg = require(`./package.json`);

const dependencies = ({ dependencies }) => Object.keys(dependencies || {});

const pkgdependencies = dependencies(pkg);
// console.log('eppp:', pkgdependencies)

module.exports =
     [
        {
            input: 'app.js',
            output: {
                format: 'cjs',
                dir: 'release',
                chunkFileNames: chunkInfo => chunkInfo.name == 'index' ? 'SERVER.js.LICENCE' : '[name]_[hash].js'
            },
            plugins: [
                babel(),
                json(),
                nodeResolve({
                    preferBuiltins: false
                }),
                commonjs({
                    strictRequires: true , 
                    dynamicRequireRoot: 'src',
                    dynamicRequireTargets: ["src/app/controllers/address.controller.js"] 
                }),
                // command(client_build , { wait: true , exitOnFail: true}),
                copy({targets:copyTargets}),
                command([`cd release && npm install --production && pm2 delete ${pkg.description} && pm2 start app.js --name=${pkg.description} && cd..`] , {wait: true ,exitOnError: false}),
                terser({output: { comments: 'all'}})
            ],
            external: pkgdependencies
        }
    ]
