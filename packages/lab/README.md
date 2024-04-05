# Lucide Lab

## Installation

```sh
npm install @lucide/lab
```

```sh
yarn add @lucide/lab
```

```sh
pnpm install @lucide/lab
```

## Usage

### React

```jsx
import { burger } from '@lucide/lab';
import { Icon } from 'lucide-react';

function App() {
  return (
    <div>
      <Icon iconNode={burger} />
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { burger } from '@lucide/lab';
import {  } from 'lucide-vue-next';
</script>

<template>
  <div>
    <Icon :iconNode="burger" />
  </div>
</template>
```

### Svelte

```svelte
<script>
import { Icon } from 'lucide-svelte';
import { burger, sausage } from '@lucide/lab';
</script>

<Icon iconNode={burger} />
<Icon iconNode={sausage} color="red"/>
```

### Solid

```jsx
import { burger } from '@lucide/lab';
import { Icon } from 'lucide-solid';

function App() {
  return (
    <div>
      <Icon iconNode={burger} />
    </div>
  );
}
```

### Preact

```jsx
import { burger } from '@lucide/lab';
import { Icon } from 'lucide-preact';

function App() {
  return (
    <div>
      <Icon iconNode={burger} />
    </div>
  );
}
```

### React Native

```jsx

import { burger } from '@lucide/lab';
import { Icon } from 'lucide-react-native';

function App() {
  return (
    <div>
      <Icon iconNode={burger} />
    </div>
  );
}
```

## Community

Join the community on our [Discord](https://discord.gg/EH6nSts) server!

## License

Lucide is totally free for commercial use and personally use, this software is licensed under the [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
