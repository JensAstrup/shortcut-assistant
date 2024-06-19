const baseConfig = require('eslint-config-yenz')

module.exports = {
  ...baseConfig,
  "env": {
    "es2022": true,
    "jest": true,
    "node": true,
    "browser": true,
    "webextensions": true
  },
  "rules": {
    ...baseConfig.rules,
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "@sx/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": [
          "builtin"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
  "overrides": [
    {
      files: ["**/*.test.*"],
      rules: {
        "no-magic-numbers": "off"
      }
    }
  ]
}
