const net = require( 'net' );
const PacketBuilder = require( './PacketBuilder' );
const PacketReader = require( './PacketReader' );

const DEFAULT_PORT = 25565;
const PROTOCOL_VERSION = 47;

function ping( hostname, port ) {
   let hostType = typeof hostname;
   if( hostType !== 'string' ) {
      return Promise.reject( new Error( 'hostname must be a string not ' + hostType ) );
   }

   let portType = typeof port;
   if( portType === 'undefined' ) {
      port = DEFAULT_PORT
   } else if( portType !== 'number' ) {
      port = new Number( port ).valueOf();
      if( isNaN( port ) ) return Promise.reject( new Error( 'port must be a number not ' + portType ) );
   }

   if( port < 1 || port > 65535 ) {
      return Promise.reject( new Error( 'port must be in range 1-65535' ) );
   }

   return new Promise( ( resolve, reject ) => {
      const socket = net.connect( port, hostname );

      socket.on( 'error', err => {
         reject( err );

         socket.destroy();
      } );

      socket.on( 'connect', () => {
         let handshake = new PacketBuilder( 0x00 );
         handshake.writeVarInt( PROTOCOL_VERSION );
         handshake.writeString( hostname );
         handshake.writeUShort( port );
         handshake.writeVarInt( 1 ); // next state, 1 = status
         socket.write( handshake.build() );

         let requestStatus = new PacketBuilder( 0x00 );
         socket.write( requestStatus.build() );
      } );

      let buffer = Buffer.allocUnsafe(0)
      socket.on( 'data', chunk => {
         buffer = Buffer.concat( [buffer, chunk] );

         let packet = PacketReader.from( buffer );
         if( packet.length > packet.data.length - packet.offset ) return;

         let packetId = packet.readVarInt();
         if( packetId !== 0 ) {
            reject( new Error( 'Invalid packet recieved' ) );

            return;
         }

         socket.destroy();

         try {
            resolve( JSON.parse( packet.readString() ) );
         } catch( err ) {
            reject( err );
         }
      } );
   } );
}

module.exports = ping;
