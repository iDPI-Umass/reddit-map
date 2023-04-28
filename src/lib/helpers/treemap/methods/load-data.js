const loadData = function ( data ) {
  this.data = data
    .sum( d => Math.sqrt( d.comment_count ))
    .sort( function ( a, b ) {
      return Math.sqrt(a.value) - Math.sqrt(b.value);
    });

  console.log( "treemap data", this.data );
  this.parent = this.data;
  this.isTopLevel = true;
  this.view = this.data.children;
};

export {
  loadData
}