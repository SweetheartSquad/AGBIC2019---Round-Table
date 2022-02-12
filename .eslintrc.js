module.exports = {
	root: true,
	extends: ['airbnb-base', 'prettier'],
	env: {
		browser: true,
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
		ecmaFeatures: {
			modules: true,
		},
	},
	rules: {
		'max-len': 'off', // just apply common-sense
		'no-param-reassign': 'off',
		'import/no-extraneous-dependencies': ['error', { devDependencies: true }], // all dev deps
		'no-bitwise': 'off', // for physics masks

		// prefer named
		'import/prefer-default-export': 'off',
		'import/no-default-export': 'error',

		'import/no-cycle': 'off', // fix + re-enable

		// stylistic preferences
		'no-console': 'warn',
		'class-methods-use-this': 'warn',
		'max-classes-per-file': 'warn',

		// tabs instead of spaces
		'no-tabs': 'off',
		indent: ['error', 'tab', { SwitchCase: 1 }],

		'import/extensions': ['error', 'never'],
		'no-multi-assign': 'off',
		'no-plusplus': 'off',
		'no-continue': 'off',
		'lines-between-class-members': 'off',
	},
};
