class PacketReader {
   static from( buffer ) {
      let packet = new PacketReader()

      packet.offset = 0;
      packet.data = buffer;

      packet.length = packet.readVarInt();

      return packet;
   }

   readVarInt() {
      let value = 0;

      let index = 0;
      while( true ) {
         let i = this.data.readUInt8( this.offset++ );
         value |= ( i & 0x7F ) << index++ * 7;

         if( ( i & 0x80 ) != 128 ) break;
      }

      return value;
   }

   readString() {
      let length = this.readVarInt();

      let value = this.data.toString( 'utf8', this.offset, this.offset + length );
      this.offset += length

      return value;
   }
}

module.exports = PacketReader;
