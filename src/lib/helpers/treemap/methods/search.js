const search = function ( subrootID ) {
    const subreddit = this.hierarchyMap.get( subrootID )
    this.parent = subreddit.parent;
    this.isTopLevel = this.parent === this.data;
    this.view = this.parent.children;
    this.resetScale( this.parent );
    this.render();
  };
   
  export { search }