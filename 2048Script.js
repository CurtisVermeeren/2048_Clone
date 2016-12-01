window.onload = function() {

	//Set the tile width in pixels
	var tileSize = 100;

	//Create a new phaser game, width is 4 tiles
	var game = new Phaser.Game(tileSize*4,tileSize*4,Phaser.CANVAS,"2048-Game",{preload:onPreload, create:onCreate});

  //Game array. Start with all cells empty zero values
	var fieldArray = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

	//Group to hold all tile sprites
	var tileSprites;

  //Variables to handle keyboard input
	var upKey;
	var downKey;
	var leftKey;
	var rightKey;

	//colours to tint tiles according to their value
	var colours = {
		2:0xFFFFFF,
		4:0xFFEEEE,
		8:0xFFDDDD,
		16:0xFFCCCC,
    	32:0xFFBBBB,
		64:0xFFAAAA,
		128:0xFF9999,
		256:0xFF8888,
		512:0xFF7777,
		1024:0xFF6666,
		2048:0xFF5555,
		4096:0xFF4444,
		8192:0xFF3333,
		16384:0xFF2222,
		32768:0xFF1111,
		65536:0xFF0000,
		131072:0xe60000
	}

	//Beginning of the game the player can't move
  var canMove = false;

    //Preload the game
	function onPreload() {
		//Preload the tile image into the game
		game.load.image("tile", "https://raw.githubusercontent.com/CurtisVermeeren/2048_Clone/master/tile.png");
	}

	//When the game has been created
	function onCreate() {

		//Listed for WASD kets
		upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		upKey.onDown.add(moveUp,this);

		downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    downKey.onDown.add(moveDown,this);

		leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    leftKey.onDown.add(moveLeft,this);

		rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    rightKey.onDown.add(moveRight,this);

		//Declare the sprite group
		tileSprites = game.add.group();

		//Begin the game with two "2 tiles"
		addTile();
		addTile();
	}

	// Add a new tile to the game
	function addTile(){

		//Get the value of the tile to be added either 2 or 4
		var value;
		//Get a random number from 1 to 10
		var prob = Math.floor((Math.random() * 10) + 1);

		//If 10 than add a 4 giving a 4 tile a 10% chance
		if (prob == 10){
			value = 4;
		//Otherwise add a 2 giving a 2 tile a 90% chance
		} else {
			value = 2;
		}

		//Choose an empty tile field to add it to
		do {
			var randomValue = Math.floor(Math.random()*16);
		} while (fieldArray[randomValue]!=0)

		//The empty tile field now has the value 2
		fieldArray[randomValue]=value;

		//Create a new sprite with the preloaded "tile.png"
		var tile = game.add.sprite(toCol(randomValue)*tileSize,toRow(randomValue)*tileSize,"tile");

		//Create the property position and assign the index of the new tile
		tile.pos = randomValue;

		//At the beginning of the game the tile is transparent
		tile.alpha = 0;

		//Add text with the value of the tile
		var text = game.add.text(tileSize/2,tileSize/2,value,{font:"bold 16px Arial",align:"center"});

		//Anchor text in the center
		text.anchor.set(0.5);

		//Add text as a child of the tile sprite
		tile.addChild(text);

		//Add tile sprite to the group
		tileSprites.add(tile);

		//Create a phaser tween to fase in the tile
		var fadeIn = game.add.tween(tile);
		fadeIn.to({alpha:1},250);
		fadeIn.onComplete.add(function(){
			//Update Values
			updateNumbers();

			//Make movement possible
			canMove=true;
		})
			//Start the tween
			fadeIn.start();
		}


		//Given a number in a 1D array return a row
		function toRow(n){
			return Math.floor(n/4);
		}

		//Given a number in a 1D array return a column
		function toCol(n){
			return n%4;
		}

		//Function to update the value and colour of each tile
		function updateNumbers(){
			tileSprites.forEach(function(item){
				//Get the value to show
				var value = fieldArray[item.pos];

				//Show the value
				item.getChildAt(0).text=value;

				//Colour the tile according to the value
				item.tint=colours[value]
			});
		}

		//Function to move tiles left
		function moveLeft(){

			//If the player allowed to move?
            if(canMove){
            	//Prevent moving until current movement is complete
                canMove=false;

				//Track if the player has moved
                var moved = false;

				//Sort the group
     			tileSprites.sort("x",Phaser.Group.SORT_ASCENDING);

				//Loop through the element in the group
     			tileSprites.forEach(function(item){

					//Get the row and column from the 1D array
     				var row = toRow(item.pos);
     				var col = toCol(item.pos);

     				//Check that it isn't the leftmost column (Tile can't move in this case)
     				if(col>0){

						//Set remove flag to false. Sometimes tiles must be removed when two merge into one
     					var remove = false;

						//Loop through the column position back to the leftmost column
     					for(i=col-1;i>=0;i--){

							// If we find a non empty tile end the search
     						if(fieldArray[row*4+i]!=0){
     							//Check if the tile landing on has the same value of the moved tile
     							if(fieldArray[row*4+i]==fieldArray[row*4+col]){
									//In this case remove the current tile
     								remove = true;
     								i--;
     							}
     							break;
     						}
     					}
     					//If we can actually move the tile
     					if(col != i+1){
     						//Set moved to true
                            moved=true;

							//Moving the tile item if allowed
                            moveTile(item,row*4+col,row*4+i+1,remove);
     					}
     				}
     			});
				//Completeing the move
     			endMove(moved);
			}
		}

		// FUNCTION TO COMPLETE THE MOVE AND PLACE ANOTHER "2" IF WE CAN
		function endMove(m){
			//If we moved the tile
			if(m) {
				//Add another two
     			addTile();
            }
			else {
                //Otherwise let the player move again
				canMove=true;
			}
		}

		//Function to move a tile
		function moveTile(tile,from,to,remove){
			//First update the array with all new values
       		fieldArray[to]=fieldArray[from];
           	fieldArray[from]=0;
           	tile.pos=to;

			//Create a movement tween
            var movement = game.add.tween(tile);
            movement.to({x:tileSize*(toCol(to)),y:tileSize*(toRow(to))},150);

			//If the tile has to be removed
			if(remove){
            	//Multiply the destination by 2 (tiles have merged)
                fieldArray[to]*=2;

				//At the end of the tween destroy the tile
                movement.onComplete.add(function(){
                	tile.destroy();
                });
         	}

			//Begin the movement
            movement.start();
      	}

      	//Function to move tiles up (Same idea as left)
        function moveUp(){
        	if(canMove){
            	canMove=false;
                var moved=false;

				tileSprites.sort("y",Phaser.Group.SORT_ASCENDING);
     			tileSprites.forEach(function(item){
     				var row = toRow(item.pos);
     				var col = toCol(item.pos);
     				if(row>0){
                    	var remove=false;
     					for(i=row-1;i>=0;i--){
     						if(fieldArray[i*4+col]!=0){
     							if(fieldArray[i*4+col]==fieldArray[row*4+col]){
     								remove = true;
     								i--;
     							}
                              	break
     						}
     					}
     					if(row!=i+1){
                        	moved=true;
                            moveTile(item,row*4+col,(i+1)*4+col,remove);
     					}
     				}
     			});
     			endMove(moved);
       		}
		}

		//Function to move tiles right (Same idea as left)
        function moveRight(){
        	if(canMove){
            	canMove=false;
                var moved=false;
     			tileSprites.sort("x",Phaser.Group.SORT_DESCENDING);
     			tileSprites.forEach(function(item){
     				var row = toRow(item.pos);
     				var col = toCol(item.pos);
     				if(col<3){
                    	var remove = false;
     					for(i=col+1;i<=3;i++){
     						if(fieldArray[row*4+i]!=0){
                            	if(fieldArray[row*4+i]==fieldArray[row*4+col]){
     								remove = true;
     								i++;
     							}
     							break
     						}
     					}
     					if(col!=i-1){
                        	moved=true;
     						moveTile(item,row*4+col,row*4+i-1,remove);
     					}
     				}
     			});
     			endMove(moved);
        	}
		}

      	//Function to move tiles down (Same idea as left)
        function moveDown(){
        	if(canMove){
            	canMove=false;
                var moved=false;
     			tileSprites.sort("y",Phaser.Group.SORT_DESCENDING);
     			tileSprites.forEach(function(item){
     				var row = toRow(item.pos);
     				var col = toCol(item.pos);
     				if(row<3){
                    	var remove = false;
     					for(i=row+1;i<=3;i++){
     						if(fieldArray[i*4+col]!=0){
     							if(fieldArray[i*4+col]==fieldArray[row*4+col]){
     								remove = true;
     								i++;
     							}
                                break
     						}
     					}
     					if(row!=i-1){
                         	moved=true;
     						moveTile(item,row*4+col,(i-1)*4+col,remove);
     					}
     				}
     			});
     			endMove(moved);
            }
		}
};
