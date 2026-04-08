module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // plugins go here
            'react-native-worklets/plugin', // <--- Moved here (must be last in this array)
        ]
    };
};