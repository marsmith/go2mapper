//webpack info and links
//  https://github.com/petehunt/webpack-howto


var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var merge = require('webpack-merge');
var pkg = require('./package.json');

var PATHS = {
  src: path.join(__dirname, 'src/'),
  dist: path.join(__dirname, 'dist/')
};

var common = {
    entry: {
        app: PATHS.src + 'scripts/app.js',
        vendor: [
            'leaflet/dist/leaflet.css',
            'bootstrap/dist/css/bootstrap.css',
            PATHS.src + '/styles/main.css', 
            'leaflet', 
            'esri-leaflet', 
            'jquery', 
            // 'jquery/src/core',
            // 'jquery/src/ajax',
            // 'jquery/src/ajax/xhr',
            'bootstrap',
            // 'bootstrap/js/modal',
            // 'bootstrap/js/collapse',
            // 'bootstrap/js/transition',
            // 'bootstrap/js/tab',
            'highcharts',
            'moment',
            '@turf/convex'
        ]
    },
    output: {
        filename: 'bundle.min.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.png$/, loader: 'url-loader?limit=8192', query: { mimetype: 'image/png' } },
            { test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/, loader: 'url-loader' },
            { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader' },
            { test: /\.html$/, loader: 'raw-loader' }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'Highcharts': 'highcharts',
            'moment': 'moment',
            'convex': '@turf/convex',
            'L.esri': 'esri-leaflet'
        }),
        
        new webpack.DefinePlugin( {'VERSION': JSON.stringify(pkg.version) }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
    ]
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(common, {
        output: {
            path: PATHS.dist + 'scripts/',
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({compress: { warnings: false }}),
            new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
            new CopyWebpackPlugin([{ from: PATHS.src, to: PATHS.dist, ignore: ['app.js', 'fonts/**/*', 'styles/**/*']} ]),
            new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.min.js'),
        ]
      }
    );
    break;
  default:
    config = merge( common, {
        output: {
            path: PATHS.src + 'scripts/',
        },
        plugins: [
            new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }),
            new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.min.js'),
        ],
        devtool: 'eval-source-map',
        devServer: {
            // hot: true,
            // inline: true,
            open: true,
            contentBase: PATHS.src,
            // host: 'localhost',
            // port: 8080
        }
      }
    );
}

module.exports = config;