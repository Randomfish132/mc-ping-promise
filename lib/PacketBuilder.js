class PacketBuilder {
   constructor( id ) {
      this.length = 0;
      this.data = Buffer.allocUnsafe( 32 );

      this.writeVarInt( id );
   }

   _extend( buffer, size ) {
      return buffer.concat( [
         buffer,
         Buffer.allocUnsafe( Math.max( 32, size ) ),
      ] );
   }

   _write( method, size, value, out = this.data ) {
      if( this.length + size > out.length )
         out = _extend( out, size );

      out[method].call( out, value, this.length )
      this.length += size;
   }

   writeUShort( value ) {
      this._write( 'writeUInt16BE', 2, value );
   }

   writeString( value ) {
      this.writeVarInt( value.length );

      if( this.length + value.length > this.data.length )
         this.data = _extend( this.data, value.length );

      this.data.write( value, this.length, value.length, 'utf8' );
      this.length += value.length;
   }

   writeVarInt( value, out = this.data ) {
      while( true ) {
         if( ( value & 0xFFFFFF80 ) === 0 ) {
            this._write( 'writeUInt8', 1, value, out );

            return;
         }

         this._write( 'writeUInt8', 1, value & 0x7F | 0x80, out );
         value = value >>> 7;
      }
   }

   build() {
      let dataLength = this.length;

      let length = Buffer.allocUnsafe( 32 );
      this.writeVarInt( dataLength, length );

      return Buffer.concat( [
         length.slice( dataLength, this.length ),
         this.data.slice( 0, dataLength ),
      ] );
   }
}

module.exports = PacketBuilder;
