var webpack = require("webpack");
var path = require("path");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        polyfills: "./app/polyfills.ts",
        vendor: "./app/vendor.ts",
        app: "./app/main.ts"
    },
    cache: true,
    output: {
        path: path.join(__dirname, "../priv/static"),
        filename: "js/[name].bundle.js",
        sourceMapFilename: "js/[name].map",
        chunkFilename: "js/[id].chunk.js"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            path.join(__dirname, "./app"),
            {}
        ),
        new webpack.optimize.CommonsChunkPlugin({ name: ["app", "vendor", "polyfills"] }),
        new ExtractTextPlugin("[name].css"),
        new CopyWebpackPlugin([
            { from: "./index.html" },
            { from: "images/**/*" }
        ])
    ],
    module: {
        rules: [
            { test: /\.ts$/, use: ["awesome-typescript-loader", "angular2-template-loader", "angular-router-loader"] },
            { test: /\.css$/, use: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader!postcss-loader" }) },
            { test: /\.less$/, use: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader!postcss-loader!less-loader" }) },
            { test: /\.html$/, use: "raw-loader" },
            {
                test: /\.(eot|svg|ttf|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader",
                query: {
                    name: "./fonts/[hash].[ext]"
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: "file-loader",
                query: {
                    name: "./images/[hash].[ext]"
                }
            }
        ]
    }
};
