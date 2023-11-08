console.log('test');
//logika game  samovizivajushajusia funkcia
(function () {
   let gameOver = false;
   let isPause = false;
   let animationId = null;
   let lastTimestamp = 0;
   // console.log(window);
   //innerHeight: 452 innerWidth: 808
   let speed = 2;
   let score = 0;// kolichestvo ochkov
   let car = document.querySelector('.car');
   let carInfo = {
      width: car.clientWidth / 2,
      height: car.clientHeight,
      coords: getCoords(car),
      move: {
         top: null,
         bottom: null,
         left: null,
         right: null,
      },
   };

   console.dir(car);//121x60 raymeri mashinki
   // console.log(carInfo.coords);
   let coin = document.querySelector('.coin');
   let coinInfo = creatElelInfo(coin);

   let rock = document.querySelector('.rock');
   let rockInfo = creatElelInfo(rock);

   let danger = document.querySelector('.danger');
   let dangerInfo = creatElelInfo(danger);

   let road = document.querySelector('.road');
   let roadHeight = road.clientHeight;
   let roadWidht = road.clientWidth / 2;
   let imgs = document.querySelectorAll('.imga');

   let imgCoords = [];
   //po kayhdomu elementu prochodim s forEach
   for (let i = 0; i < imgs.length; i++) {
      let imga = imgs[i];
      let coordsTree = getCoords(imga);
      imgCoords.push(coordsTree);//dobavliaem v massiv novoe znachenie
   }
   let obstacles = [
      { element: rock, info: creatElelInfo(rock) },
      { element: danger, info: creatElelInfo(danger) }
   ];
   function getCoords(element) {
      // funkcia getComputedStyle pomogaet poluchit raschitanie stili nashego dereva 
      let matrix = window.getComputedStyle(element).transform;
      let array = matrix.split(',');
      let y = array[array.length - 1];// nasli poslednij element massiva.
      //funkcia parseFloat preobrayovivaet stroku k chislu
      let x = array[array.length - 2];
      let numberY = parseFloat(y);// funkcia privodit stroku k chislu
      let numberX = parseFloat(x);

      return { x: numberX, y: numberY };
   }
   // console.log(imgCoords);
   let tree3 = imgs[0];
   let coordsTree3 = getCoords(tree3);
   // keyDown, keyUp sobitie
   document.addEventListener('keydown', (event) => {

      if (!isPause) {
         // console.log(event);
         let code = event.code;
         if (code === 'ArrowUp' && carInfo.move.top === null) {
            carInfo.move.top = requestAnimationFrame(carMoveToTop);
         } else if (code === 'ArrowDown' && carInfo.move.bottom === null) {
            carInfo.move.bottom = requestAnimationFrame(carMoveToBottom);
         } else if (code === 'ArrowLeft' && carInfo.move.left === null) {
            carInfo.move.left = requestAnimationFrame(carMoveToLeft);
         } else if (code === 'ArrowRight' && carInfo.move.right === null) {
            carInfo.move.right = requestAnimationFrame(carMoveToRight);
         }
      }
      // console.log(event.code);
   });
   document.addEventListener('keyup', (event) => {
      let code = event.code;
      if (code === 'ArrowUp') {
         cancelAnimationFrame(carInfo.move.top);
         carInfo.move.top = null;
      } else if (code === 'ArrowDown') {
         cancelAnimationFrame(carInfo.move.bottom);
         carInfo.move.bottom = null;
      } else if (code === 'ArrowLeft') {
         cancelAnimationFrame(carInfo.move.left);
         carInfo.move.left = null;
      } else if (code === 'ArrowRight') {
         cancelAnimationFrame(carInfo.move.right);
         carInfo.move.right = null;// sbros znachenia
      }

   });
   function creatElelInfo(element) {
      return {
         coords: getCoords(element),
         width: element.clientWidth / 2,
         height: element.clientHeight
      }
   }

   function carMoveToTop() {
      const newY = carInfo.coords.y - 5;
      if (newY < 0) {
         return;
      }
      carInfo.coords.y = newY;
      carMove(carInfo.coords.x, newY);
      carInfo.move.top = requestAnimationFrame(carMoveToTop);
   }
   function carMoveToBottom() {
      let newY = carInfo.coords.y + 5;
      if (newY + carInfo.height > roadHeight) {
         return;
      }
      carInfo.coords.y = newY;
      carMove(carInfo.coords.x, newY);
      carInfo.move.bottom = requestAnimationFrame(carMoveToBottom);
   }
   function carMoveToLeft() {
      let newX = carInfo.coords.x - 5;
      if (newX < -roadWidht) {
         return;
      }
      carInfo.coords.x = newX;
      carMove(newX, carInfo.coords.y);
      carInfo.move.left = requestAnimationFrame(carMoveToLeft);
   }
   function carMoveToRight() {
      let newX = carInfo.coords.x + 5;
      if (newX > roadWidht - carInfo.width / 2) {
         return;//auto ne viezhaet ya predeli dorogi
      }
      carInfo.coords.x = newX;
      carMove(newX, carInfo.coords.y);
      carInfo.move.right = requestAnimationFrame(carMoveToRight);
   }
   function carMove(x, y) {
      car.style.transform = `translate(${x}px, ${y}px)`;
      collision();
   }

   animationId = requestAnimationFrame(startGame);//risujem aimaciju v brauzere

   function startGame() {
      if (!gameOver) {
         updateObstacleCoordinates();
         treesAnimation();
         coinAnimation()
         for (let obstacle of obstacles) {
            if ( obstacle.info && collision(carInfo,obstacle.info)) {
               gameOver = true;
               displayGameOverScreen();
               return;
            }
         }
            dangerAnimation();
            rockAnimation();


            animationId = requestAnimationFrame(startGame);// viyivaem 
            //funkciju start game bezkonechno
         }
      }

      function displayGameOverScreen() {
         let gameOverScreen = document.querySelector('.game-over-screen');
         gameOverScreen.style.visibility = 'visible';
      }

      function resetGame() {
         gameOver = false;
         // Reset game variables, positions, and any other necessary properties
         // Hide the game over screen
         let gameOverScreen = document.querySelector('.game-over-screen');
         gameOverScreen.style.visibility = 'hidden';
         // Restart the animation loop
         animationId = requestAnimationFrame(startGame);
      }

      function treesAnimation() {
         // console.log('treeAnimation called');  
         for (let i = 0; i < imgs.length; i++) {
            let imga = imgs[i];
            let coords = imgCoords[i];
            let newCoordY = coords.y + speed;
            if (newCoordY > window.innerHeight) {
               newCoordY = -imga.height;
            }
            coords.y = newCoordY;

            imga.style.transform = `translate(${coords.x}px, ${newCoordY}px)`;

         }
      }
      function coinAnimation() {
         let newYCoord = coinInfo.coords.y + speed;
         let newXCoord = coinInfo.coords.x;
         if (newYCoord > window.innerHeight) {
            newYCoord = -150;

            let directionCoin = parseInt(Math.random() * 2);//poluchaem sluchajnoe chislo libo 0 ili 1, funkcia parseInt daet celoe chislo
            let randomXCoord = parseInt(Math.random() * (roadWidht + 1));
            if (directionCoin === 0) {
               //dvigaju monetu v levo
               newXCoord = -randomXCoord;
               // pol dorogi eto 200 a choby nam pokazivalo rovno 200 a ne 199 nuzhno v kode +1
            } else if (directionCoin === 1) {
               //v pravo
               newXCoord = randomXCoord;
            }
         }
         coinInfo.coords.x = newXCoord;
         coinInfo.coords.y = newYCoord;
         coin.style.transform = `translate(${newXCoord}px, ${newYCoord}px)`;
      }
      function rockAnimation() {
         let newYCoord = rockInfo.coords.y + speed;
         let newXCoord = rockInfo.coords.x;
         if (newYCoord > window.innerHeight) {
            newYCoord = -150;

            let directionRock = parseInt(Math.random() * 2);//poluchaem sluchajnoe chislo libo 0 ili 1, funkcia parseInt daet celoe chislo
            let randomXCoord = parseInt(Math.random() * (roadWidht + 1));
            if (directionRock === 0) {
               //dvigaju monetu v levo
               newXCoord = -randomXCoord;
               // pol dorogi eto 200 a choby nam pokazivalo rovno 200 a ne 199 nuzhno v kode +1
            } else if (directionRock === 1) {
               //v pravo
               newXCoord = randomXCoord;
            }
         }
         rockInfo.coords.x = newXCoord;
         rockInfo.coords.y = newYCoord;
         rock.style.transform = `translate(${newXCoord}px, ${newYCoord}px)`;
      }
      function dangerAnimation() {
         let newYCoord = dangerInfo.coords.y + speed;
         let newXCoord = dangerInfo.coords.x;
         if (newYCoord > window.innerHeight) {
            newYCoord = - 100;

            let directionDanger = parseInt(Math.random() * 2);//poluchaem sluchajnoe chislo libo 0 ili 1, funkcia parseInt daet celoe chislo
            let randomXCoord = parseInt(Math.random() * (roadWidht + 1));
            if (directionDanger === 0) {
               //dvigaju monetu v levo
               newXCoord = -randomXCoord;
               // pol dorogi eto 200 a choby nam pokazivalo rovno 200 a ne 199 nuzhno v kode +1
            } else if (directionDanger === 1) {
               //v pravo
               newXCoord = randomXCoord;
            }
         }
         dangerInfo.coords.x = newXCoord;
         dangerInfo.coords.y = newYCoord;
         danger.style.transform = `translate(${newXCoord}px, ${newYCoord}px)`;
      }
      //funkcia nachodit coordinatz po osi x,y
     
      //funkcia kolizia na vychislenie koordinat soprikosnovania objektov
      function collision(carInfo,obstacleInfo) {
         if (!obstacleInfo) {
            return false; // Возвращаем false, так как нет информации о препятствии
         }
         let carYTop = carInfo.coords.y;
   let carYBottom = carInfo.coords.y + carInfo.height;
   let carXLeft = carInfo.coords.x - carInfo.width;
   let carXRight = carInfo.coords.x + carInfo.width;

   let obstacleYTop = obstacleInfo.coords.y;
   let obstacleYBottom = obstacleInfo.coords.y + obstacleInfo.height;
   let obstacleXLeft = obstacleInfo.coords.x;
   let obstacleXRight = obstacleInfo.coords.x + obstacleInfo.width;

   if (carYBottom < obstacleYTop
      || carYTop > obstacleYBottom
      || carXRight < obstacleXLeft
      || carXLeft > obstacleXRight) {
      return false;
   }
   return true;
}

        
      
      function togglePause() {
         isPause = !isPause;
         if (isPause) {
            cancelAnimationFrame(animationId); // Остановка анимации
            gameButton.children[0].style.display = 'none';
            gameButton.children[1].style.display = 'initial';
         } else {
            animationId = requestAnimationFrame(startGame); // Возобновление анимации
            gameButton.children[0].style.display = 'initial';
            gameButton.children[1].style.display = 'none';
         }
      }
      let gameButton = document.querySelector('.game_button');
      // console.dir(gameButton);// smotru v console vsu infu ( child (play[0] and pause[1]))
      gameButton.addEventListener('click', togglePause);
      //funkcia chobi vne yavisimosti razmera ekrana sootvetstvovali atribut
      function updateObstacleCoordinates() {
         coinInfo.coords = getCoords(coin);
         rockInfo.coords = getCoords(rock);
         dangerInfo.coords = getCoords(danger);
         for (let obstacle of obstacles) {
            obstacle.info.coords = getCoords(obstacle.element);
         }

      }
      window.addEventListener('resize', updateObstacleCoordinates);
   
   }) (); 

