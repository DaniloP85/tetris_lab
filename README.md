# Tetris - JS, HTML and CSS only

The idea is to return to the simplest and most basic programming.

At work I do a lot of system integration, not root programming, that which needs to have logic involved, so in my free time I challenge myself to make games.

This time I made a version of Tetris, it was hard work because I didn't use any framework to facilitate the construction, I also didn't use AI, I did it face to face and with courage.

It took a lot of work and refactoring to get this result.

I was thinking about a differentiator of the very popular game, I was studying [Firebase](https://firebase.google.com) a lot and I found it interesting to use it here in this project, as I didn't need to create a whole infrastructure to have a real-time connection with several users, in fact I wanted one for broadcast, where all users could see each other's scores, in real time, [Firebase](https://firebase.google.com) gives me this easily.

In this first video, I try to show two players playing at the same time and one player watching the other player's score, it almost looks like I'm advertising [Firebase](https://firebase.google.com)

1. [Tetris + Firebase](https://youtu.be/VisFw1yIg9A)

In this second video, I try to demonstrate the power of the [Firebase](https://firebase.google.com/) console, which also works in real time

2. [Tetris + Firebase](https://youtu.be/vSHtST2LCVI)

Lastly, I try to show a little of the logic applied in the game, I used a Matrix to control the filled lines and the position of the piece that is coming down, and how I can control how the pieces are filled or not.

3. [Tetris + Console](https://youtu.be/HhMLnEBCfM4)

## Demonstration

![](readme/git_completo.gif)

## Motivation

The challenge started around September 2021, I was studying [Flutter](https://flutter.dev/), it was at that moment that I found a repo in [Flutter](https://flutter.dev/) which was the game tetris and [Flutter](https://flutter.dev/) the game was incomplete and that was where my motivation to build and play was born.

![.](readme/2025-11-07%2012.57.05.jpg)

I don't remember where I got this project from, after configuring the project on my local PC, I realized that it was incomplete and that's why I was motivated to build my own Tetris.

Yes, at that time I used [Ubuntu](https://ubuntu.com/).

## Technical Challenge

The main challenge was rotating pieces on the 2D plane, where it was necessary to apply the 2D rotation formula.

#### 2D Rotation Formula

The **2D Rotation Formula** (Rotation Matrix) is a fundamental mathematical transformation that allows rotating any point on the Cartesian plane. According to linear algebra theory, the rotation of a vector around the origin can be represented by multiplication with a **rotation matrix**.

**For counterclockwise rotation** (standard mathematical convention):

$$R(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$$

**For clockwise rotation** (used in computer graphics and this project):

$$R(\theta) = \begin{bmatrix} \cos\theta & \sin\theta \\ -\sin\theta & \cos\theta \end{bmatrix}$$

**Where:**
- $\theta$ = rotation angle in radians or degrees
- The formula is applied by multiplication: $[x', y'] = R(\theta) \cdot [x, y]$

**For a specific 90-degree clockwise rotation:**

$$R(90°) = \begin{bmatrix} 0 & 1 \\ -1 & 0 \end{bmatrix}$$

This is the most efficient transformation for Tetris, as trigonometric calculations (cos, sin) result in integer values (0, 1, -1).

### Solution: Rotating Pieces Using 2D Rotation Formula

#### The 2D Rotation Formula

Rotation of a point in a 2D matrix is performed through the **2D Rotation Formula**. For a **90-degree clockwise rotation**, the transformation is:

$$\begin{cases}
x' = j \\
y' = n - 1 - i
\end{cases}$$

Where:
- $(i, j)$ is the original position of the element (row `i`, column `j`)
- $(x', y')$ is the position after rotation
- `n` is the size of the matrix (square dimension)

#### Algorithm Implementation

The central method that performs the rotation in the `rotacao.js` file is:

```javascript
#rotate90 = (matrix) => {
    let matrixEmpty = this.#emptyMatrix(matrix.length);

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            matrixEmpty[j][matrix.length - 1 - i] = matrix[i][j];
        }
    }

    return matrixEmpty;
}
```

**How it works:**
- `matrix[i][j]` = original position (row `i`, column `j`)
- `matrixEmpty[j][matrix.length - 1 - i]` = position after rotation
- At each iteration, each element is repositioned following the formula

#### T-Piece Rotation Scenarios

The T piece in Tetris has exactly **4 different rotation states**. Below is the complete progression:

##### **State 0° - Initial Position (Pointing Down)**

```
  0 1 2
0 0 0 0
1 0 ■ 0
2 ■ ■ ■
```

Compact representation:
```
  ■
■ ■ ■
```

##### **90° Rotation (Pointing Right)**

Applying `#rotate90` once:

```
  0 1 2
0 0 ■ 0
1 0 ■ ■
2 0 ■ 0
```

Compact representation:
```
■
■ ■
■
```

**How the formula was applied:**
- `matrix[0][1]` (■) → `matrixEmpty[1][3-1-0]` = `matrixEmpty[1][2]` 
- `matrix[1][0]` (■) → `matrixEmpty[0][3-1-1]` = `matrixEmpty[0][1]`
- `matrix[1][1]` (■) → `matrixEmpty[1][3-1-1]` = `matrixEmpty[1][1]`
- `matrix[1][2]` (■) → `matrixEmpty[2][3-1-1]` = `matrixEmpty[2][1]`

##### **180° Rotation (Pointing Up)**

Applying `#rotate90` twice:

```
  0 1 2
0 ■ ■ ■
1 0 ■ 0
2 0 0 0
```

Compact representation:
```
■ ■ ■
  ■
```

##### **270° Rotation (Pointing Left)**

Applying `#rotate90` three times:

```
  0 1 2
0 0 ■ 0
1 ■ ■ 0
2 0 ■ 0
```

Compact representation:
```
  ■
■ ■
  ■
```

#### Complete Rotation Flow

1. **`#makeConvertPositions(part)`** 
   - Extracts the (x, y) coordinates of the moving piece
   - Creates a normalized matrix based on the piece size
   - Subtracts minX and minY to center the matrix

2. **Angle Determination**
   - The next angle is determined by the sequence: `[0°, 90°, 180°, 270°, 0°, ...]`
   - The class maintains tracking of the current angle in `this.#part.angle`

3. **`#rotate90(matrix)`**
   - Applies the 2D rotation formula
   - Repeats as needed (up to 3 times to return to previous state)

4. **Conversion back to canvas coordinates**
   - Converts the rotated matrix to (x, y) canvas coordinates
   - Multiplies indices by 33 (size of each cell)
   - Adds minX and minY to position correctly

#### Collision Validation Post-Rotation

Before accepting the rotation, the `isPossible` method validates:

```javascript
isPossible = (current, matrix) => {
    // Check if it doesn't go beyond the right edge (x = 297)
    if (current.map(part => part.x).indexOf(297) != -1) return true;
    
    // Check if it doesn't go beyond the left edge (x = -33)
    if (current.map(part => part.x).indexOf(-33) != -1) return true;
    
    // Check if it doesn't go beyond the bottom edge (y = 594)
    if (current.map(part => part.y).indexOf(594) != -1) return true;
    
    // Check if it doesn't collide with already placed pieces
    for (let i = 0; i < current.length; i++) {
        const { y, x } = current[i];
        const nextLocation = matrix[y / 33][x / 33];
        if (nextLocation != "c" && colors.indexOf(nextLocation) != -1) {
            return true; // Collision detected
        }
    }
}
```

#### Advantages of This Approach

✅ **Mathematical elegance** - Uses well-defined linear transformations  
✅ **Deterministic** - Always produces the same result  
✅ **Efficient** - O(n²) where n is the piece size (3x3 or 4x4)  
✅ **Extensible** - Works for any piece format  
✅ **Testable** - Easy to test and verify  

---

## Authors

Danilo Santos [@danilopsnts](https://www.linkedin.com/in/danilopsnts/)
<!-- branch protection test: US1 -->
