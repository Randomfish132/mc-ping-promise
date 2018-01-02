# mc-ping-promise
A promise based Minecraft ping library.

## Example usage
Using promises:
```js
const mcping = require( 'mc-ping-promise' );

mcping( 'example.com', 25565 )
   .then( data => console.log( data ) )
   .catch( err => console.log( err ) );
```

Using async/await:
```js
const mcping = require( 'mc-ping-promise' );

try {
   let data = await mcping( 'example.com', 25565 );

   console.log( data );
} catch( err ) {
   console.log( err );
}
```
