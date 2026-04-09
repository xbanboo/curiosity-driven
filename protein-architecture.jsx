import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ── Built-in protein data ──
const BUILTIN_DATA = {"1CRN":{"atoms":[[0.0,0.0,2.3],[2.27,1.5,-0.4],[-0.79,3.0,-2.16],[-1.99,4.5,1.15],[1.48,6.0,1.76],[1.48,7.5,-1.76],[-1.99,9.0,-1.15],[-0.79,10.5,2.16],[2.27,12.0,0.4],[0.0,13.5,-2.3],[-2.27,15.0,0.4],[0.79,16.5,2.16],[0.57,16.24,1.99],[3.25,14.14,1.86],[4.1,11.77,5.73],[5.17,10.35,9.75],[5.0,10.0,9.2],[8.3,10.0,6.8],[11.6,10.0,9.2],[14.9,10.0,6.8],[18.2,10.0,9.2],[21.5,10.0,6.8],[22.48,10.17,5.69],[14.23,2.87,6.87],[10.06,-5.16,3.8],[10.0,-5.66,0.8],[12.36,-6.39,3.83],[9.18,-7.38,5.97],[7.92,-9.83,3.25],[11.54,-11.51,3.11],[11.54,-11.99,6.94],[7.92,-13.67,6.8],[9.18,-16.12,4.08],[12.36,-17.11,6.22],[10.0,-17.84,9.25],[7.82,-18.31,9.99],[9.56,-14.24,7.75],[6.87,-8.75,3.46],[5.6,-8.23,-0.87],[2.09,-3.37,2.31]],"ss":["helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","sheet","sheet","sheet","sheet","sheet","sheet","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","coil"],"res":["TRP","ILE","ASP","ILE","PHE","ILE","MET","GLN","LYS","GLU","LYS","GLU","GLU","LYS","ASP","GLU","GLU","PRO","ASN","HIS","GLU","LYS","ASP","ALA","TRP","ASN","ILE","LYS","PRO","CYS","THR","LYS","GLU","GLU","HIS","HIS","LYS","HIS","GLY","MET"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A"]},"1UBQ":{"atoms":[[0.0,0.0,1.2],[3.3,0.0,-1.2],[6.6,0.0,1.2],[9.9,0.0,-1.2],[13.2,0.0,1.2],[16.5,0.0,-1.2],[19.8,0.0,1.2],[23.1,0.0,-1.2],[19.76,3.94,-0.07],[22.89,2.61,-1.08],[20.51,5.73,4.15],[20.0,4.19,7.15],[21.19,7.4,5.47],[17.83,7.79,3.74],[16.05,7.26,7.08],[18.26,9.87,8.71],[17.51,12.31,5.86],[13.8,11.67,6.27],[14.08,12.27,10.04],[15.94,15.52,9.37],[13.25,16.61,6.9],[10.56,15.8,9.48],[12.42,17.81,12.11],[12.7,20.74,9.67],[8.99,20.53,8.94],[7.16,19.02,10.28],[7.54,20.58,5.91],[7.15,19.86,8.98],[9.87,18.34,10.16],[8.0,21.2,10.0],[4.7,18.8,10.0],[1.4,21.2,10.0],[-1.9,18.8,10.0],[-5.2,21.2,10.0],[-8.5,18.8,10.0],[-11.8,21.2,10.0],[-13.16,20.96,10.85],[-8.5,18.15,6.74],[-13.94,15.13,3.22],[-8.8,15.0,5.0],[-11.2,11.7,5.0],[-8.8,8.4,5.0],[-11.2,5.1,5.0],[-8.8,1.8,5.0],[-11.2,-1.5,5.0],[-9.55,-0.2,5.97],[-11.15,0.08,5.13],[-6.14,3.91,5.47],[-8.12,0.46,0.24],[-3.91,3.92,2.71],[-5.0,3.0,1.2],[-1.7,3.0,-1.2],[1.6,3.0,1.2],[4.9,3.0,-1.2],[8.2,3.0,1.2],[11.5,3.0,-1.2],[14.8,3.0,1.2],[18.1,3.0,-1.2],[17.85,3.07,-0.09],[16.77,2.0,-0.46],[13.81,3.33,0.64],[17.32,2.31,2.8],[14.7,-2.02,2.65]],"ss":["sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","sheet","sheet","sheet","sheet","sheet","sheet","sheet","coil","coil","coil","sheet","sheet","sheet","sheet","sheet","sheet","coil","coil","coil","coil","coil","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","coil","coil","coil","coil","coil"],"res":["ILE","LYS","CYS","LYS","GLY","SER","GLU","GLU","ASP","LYS","ILE","GLU","ASP","ALA","VAL","TRP","ILE","CYS","THR","GLU","HIS","ARG","PRO","THR","VAL","ARG","GLN","GLN","ASP","ASP","MET","LYS","ILE","GLU","GLU","HIS","ARG","GLU","ARG","GLU","LYS","THR","ASP","ARG","HIS","ASP","ASP","HIS","ASP","ILE","MET","GLN","MET","LEU","MET","MET","TYR","ASN","CYS","HIS","ARG","ILE","THR"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A"]},"4HHB":{"atoms":[[15.0,13.82,1.97],[17.37,14.6,-0.71],[16.64,18.08,-0.67],[16.99,17.85,3.05],[20.06,16.21,2.78],[21.11,18.77,0.21],[20.14,21.29,2.43],[21.89,19.61,5.29],[24.72,19.43,3.13],[24.45,22.93,2.08],[24.18,23.65,5.66],[27.01,21.67,6.52],[28.95,21.28,4.12],[28.02,24.53,9.89],[27.41,23.62,13.95],[35.2,25.51,14.98],[35.2,26.07,17.21],[36.62,27.27,14.13],[33.65,27.16,12.34],[32.21,28.81,15.34],[34.62,31.17,15.38],[34.17,31.51,11.66],[30.86,31.85,12.21],[31.4,34.21,15.03],[33.47,35.87,12.8],[31.15,35.75,10.05],[28.83,36.75,12.53],[30.9,39.46,13.72],[31.44,40.21,10.12],[28.13,40.25,9.48],[27.68,42.31,12.6],[25.82,41.05,12.67],[24.43,44.18,9.38],[17.95,43.14,5.86],[17.95,41.51,4.23],[20.3,43.47,6.09],[18.89,42.89,9.17],[18.79,39.37,8.0],[22.0,39.42,7.09],[22.75,41.16,10.33],[21.04,38.75,11.88],[22.64,36.08,9.86],[25.55,37.66,10.78],[24.7,38.02,14.24],[25.67,34.55,13.74],[23.14,30.96,10.27],[21.74,18.74,4.96],[16.99,12.29,3.49],[-15.0,13.82,1.97],[-12.63,14.6,-0.71],[-13.36,18.08,-0.67],[-13.01,17.85,3.05],[-9.94,16.21,2.78],[-8.89,18.77,0.21],[-9.86,21.29,2.43],[-8.11,19.61,5.29],[-5.28,19.43,3.13],[-5.55,22.93,2.08],[-5.82,23.65,5.66],[-2.99,21.67,6.52],[-2.26,26.67,6.47],[-0.39,23.13,8.85],[3.82,25.93,9.75],[1.41,25.31,15.69],[1.41,25.87,17.92],[2.83,27.07,14.84],[-0.14,26.96,13.05],[-1.58,28.61,16.05],[0.83,30.97,16.09],[0.38,31.31,12.37],[-2.93,31.65,12.92],[-2.39,34.01,15.74],[-0.32,35.67,13.51],[-2.64,35.55,10.76],[-4.96,36.75,13.24],[-2.89,39.26,14.43],[-2.35,40.01,10.83],[-5.66,40.05,10.19],[-6.11,42.11,13.31],[-8.13,38.73,10.45],[-10.22,42.96,11.33],[-15.26,42.27,5.28],[-15.26,40.64,3.65],[-12.91,42.6,5.51],[-14.32,42.02,8.59],[-14.42,38.5,7.42],[-11.21,38.55,6.51],[-10.46,40.29,9.75],[-12.17,37.88,11.3],[-10.57,35.21,9.28],[-7.66,36.79,10.2],[-8.51,37.15,13.66],[-8.02,37.71,15.15],[-8.49,27.81,11.8],[-11.04,18.06,5.11],[-12.88,6.75,2.23],[-15.0,-16.18,1.97],[-12.63,-15.4,-0.71],[-13.36,-11.92,-0.67],[-13.01,-12.15,3.05],[-9.94,-13.79,2.78],[-8.89,-11.23,0.21],[-9.86,-8.71,2.43],[-8.11,-10.39,5.29],[-5.28,-10.57,3.13],[-5.55,-7.07,2.08],[-5.82,-6.35,5.66],[-2.99,-8.33,6.52],[-2.62,-8.87,5.45],[-0.77,-4.75,9.24],[-0.42,-7.22,11.75],[0.11,-5.52,14.61],[0.11,-4.96,16.84],[1.53,-3.76,13.76],[-1.44,-3.87,11.97],[-2.88,-2.22,14.97],[-0.47,0.14,15.01],[-0.92,0.48,11.29],[-4.23,0.82,11.84],[-3.69,3.18,14.66],[-1.62,4.84,12.43],[-3.94,4.72,9.68],[-6.26,5.92,12.16],[-4.19,8.43,13.35],[-3.65,9.18,9.75],[-6.96,9.22,9.11],[-7.41,11.28,12.23],[-4.64,12.7,13.78],[-12.48,13.28,8.02],[-14.94,13.91,6.08],[-14.94,12.28,4.45],[-12.59,14.24,6.31],[-14.0,13.66,9.39],[-14.1,10.14,8.22],[-10.89,10.19,7.31],[-10.14,11.93,10.55],[-11.85,9.52,12.1],[-10.25,6.85,10.08],[-7.34,8.43,11.0],[-8.19,8.79,14.46],[-5.19,9.64,11.61],[-8.63,-1.42,10.31],[-10.03,-9.82,3.09],[-13.74,-18.84,3.95],[15.0,-16.18,1.97],[17.37,-15.4,-0.71],[16.64,-11.92,-0.67],[16.99,-12.15,3.05],[20.06,-13.79,2.78],[21.11,-11.23,0.21],[20.14,-8.71,2.43],[21.89,-10.39,5.29],[24.72,-10.57,3.13],[24.45,-7.07,2.08],[24.18,-6.35,5.66],[27.01,-8.33,6.52],[29.86,-5.63,3.44],[29.83,-10.2,11.61],[30.72,-8.04,14.87],[32.98,-8.17,14.96],[32.98,-7.61,17.19],[34.4,-6.41,14.11],[31.43,-6.52,12.32],[29.99,-4.87,15.32],[32.4,-2.51,15.36],[31.95,-2.17,11.64],[28.64,-1.83,12.19],[29.18,0.53,15.01],[31.25,2.19,12.78],[28.93,2.07,10.03],[26.61,3.27,12.51],[28.68,5.78,13.7],[29.22,6.53,10.1],[25.91,6.57,9.46],[25.46,8.63,12.58],[24.36,8.8,11.88],[23.52,7.5,10.56],[20.18,9.39,7.9],[20.18,7.76,6.27],[22.53,9.72,8.13],[21.12,9.14,11.21],[21.02,5.62,10.04],[24.23,5.67,9.13],[24.98,7.41,12.37],[23.27,5.0,13.92],[24.87,2.33,11.9],[27.78,3.91,12.82],[26.93,4.27,16.28],[27.23,3.24,17.25],[24.1,-5.24,14.16],[22.16,-12.16,5.8],[16.82,-18.15,1.78]],"ss":["helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil"],"res":["VAL","THR","LYS","VAL","ARG","LYS","LYS","GLY","HIS","ASP","ARG","HIS","GLU","LYS","ASP","ARG","ASP","HIS","HIS","GLU","LYS","ARG","ASP","LYS","HIS","LYS","ASP","LYS","HIS","LYS","ARG","LYS","ARG","LYS","HIS","GLU","GLU","ARG","ARG","GLU","HIS","HIS","LYS","ARG","HIS","ASP","ASN","MET","HIS","HIS","LYS","ARG","ARG","ARG","GLU","HIS","ARG","GLU","ASP","GLY","HIS","SER","PHE","ILE","GLU","ASP","ASP","GLU","ARG","HIS","ASP","ARG","ARG","HIS","GLU","ARG","ARG","ARG","GLU","GLU","ASP","ASP","ARG","GLU","GLU","HIS","ARG","ASP","HIS","GLU","ASP","ARG","GLU","ARG","HIS","HIS","HIS","LYS","ARG","HIS","HIS","ARG","HIS","ARG","GLU","ARG","ARG","LYS","GLU","LYS","HIS","ARG","GLU","LYS","ARG","ASP","LYS","GLU","LYS","LYS","GLY","ASP","GLU","GLU","MET","GLU","GLU","MET","ARG","LYS","HIS","ARG","ARG","ASP","GLU","ARG","ARG","HIS","ASP","HIS","ARG","ARG","ASP","LYS","LYS","ARG","ARG","HIS","HIS","HIS","GLU","ARG","GLU","LYS","ARG","ARG","ASP","ARG","LYS","ARG","GLU","ARG","GLU","HIS","HIS","ASP","ARG","HIS","HIS","ASP","ASP","ARG","GLU","ARG","GLU","ASP","LYS","ASN","PRO","ASN","ASN","ASN","ASP","ARG","ASP","HIS","ASP","LYS","GLU","ASP","ASP","ASP"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D","D"]},"1BNA":{"atoms":[[10,0,0],[8.09,3.4,5.88],[3.09,6.8,9.51],[-3.09,10.2,9.51],[-8.09,13.6,5.88],[-10,17,0],[-8.09,20.4,-5.88],[-3.09,23.8,-9.51],[3.09,27.2,-9.51],[8.09,30.6,-5.88],[10,34,0],[8.09,37.4,5.88],[3.09,40.8,9.51],[-3.09,44.2,9.51],[-8.09,47.6,5.88],[-10,51,0],[-8.09,54.4,-5.88],[-3.09,57.8,-9.51],[3.09,61.2,-9.51],[8.09,64.6,-5.88],[10,68,0],[8.09,71.4,5.88],[3.09,74.8,9.51],[-3.09,78.2,9.51],[-8.09,81.6,5.88],[-10,85,0],[-8.09,88.4,-5.88],[-3.09,91.8,-9.51],[3.09,95.2,-9.51],[8.09,98.6,-5.88],[-10,0,0],[-8.09,3.4,-5.88],[-3.09,6.8,-9.51],[3.09,10.2,-9.51],[8.09,13.6,-5.88],[10,17,0],[8.09,20.4,5.88],[3.09,23.8,9.51],[-3.09,27.2,9.51],[-8.09,30.6,5.88],[-10,34,0],[-8.09,37.4,-5.88],[-3.09,40.8,-9.51],[3.09,44.2,-9.51],[8.09,47.6,-5.88],[10,51,0],[8.09,54.4,5.88],[3.09,57.8,9.51],[-3.09,61.2,9.51],[-8.09,64.6,5.88],[-10,68,0],[-8.09,71.4,-5.88],[-3.09,74.8,-9.51],[3.09,78.2,-9.51],[8.09,81.6,-5.88],[10,85,0],[8.09,88.4,5.88],[3.09,91.8,9.51],[-3.09,95.2,9.51],[-8.09,98.6,5.88]],"ss":Array(60).fill("helix"),"res":["THR","ALA","SER","THR","SER","LYS","GLY","THR","LYS","VAL","LEU","SER","GLY","SER","VAL","GLY","ALA","VAL","ASP","ASP","THR","GLY","THR","GLY","VAL","GLY","ALA","LEU","ASP","LEU","SER","LYS","THR","LEU","VAL","LEU","VAL","VAL","ALA","THR","GLY","THR","ASP","LYS","THR","LYS","LYS","LYS","ALA","GLY","VAL","THR","ASP","THR","VAL","LEU","LYS","LEU","ASP","LEU"],"chains":[...Array(30).fill("A"),...Array(30).fill("B")]},"1EMA":{"atoms":[[1.8,-12.0,0.0],[-0.31,-10.5,1.77],[-1.69,-9.0,-0.62],[0.9,-7.5,-1.56],[1.38,-6.0,1.16],[-1.38,-4.5,1.16],[-0.9,-3.0,-1.56],[1.69,-1.5,-0.62],[0.31,0.0,1.77],[-1.8,1.5,0.0],[0.31,3.0,-1.77],[1.69,4.5,0.62],[9.2,-10.5,-0.0],[10.8,-9.5,2.8],[9.2,-10.5,5.6],[10.8,-9.5,8.4],[9.2,-10.5,11.2],[9.4,-10.38,11.63],[8.82,-10.16,5.3],[7.74,-10.5,5.84],[7.57,-9.5,7.33],[4.71,-10.5,10.55],[4.54,-9.5,12.04],[1.68,-10.5,15.26],[1.11,-9.97,14.46],[3.91,-10.28,8.78],[3.82,-10.5,9.82],[1.94,-9.5,9.53],[-1.27,-10.5,12.15],[-3.15,-9.5,11.86],[-6.37,-10.5,14.48],[-6.27,-9.84,14.72],[-0.7,-9.85,10.31],[-1.31,-10.5,10.69],[-4.31,-9.5,8.71],[-6.85,-10.5,9.89],[-9.85,-9.5,7.91],[-12.4,-10.5,9.1],[-12.84,-10.23,8.83],[-6.81,-10.58,7.09],[-6.02,-10.5,8.16],[-9.19,-9.5,5.12],[-10.26,-10.5,4.49],[-13.42,-9.5,1.45],[-14.49,-10.5,0.83],[-14.73,-9.52,1.11],[-9.48,-9.63,3.5],[-8.83,-10.5,3.04],[-11.15,-9.5,-0.09],[-10.41,-10.5,-2.33],[-12.73,-9.5,-5.47],[-11.98,-10.5,-7.7],[-12.56,-9.61,-6.95],[-9.97,-9.69,-3.03],[-8.83,-10.5,-3.04],[-9.57,-9.5,-5.28],[-7.25,-10.5,-8.42],[-8.0,-9.5,-10.65],[-5.67,-10.5,-13.79],[-6.14,-10.33,-12.99],[-6.75,-10.56,-6.56],[-6.02,-10.5,-8.16],[-4.96,-9.5,-8.79],[-1.79,-10.5,-11.83],[-0.72,-9.5,-12.45],[2.44,-10.5,-15.5],[3.02,-10.66,-16.37],[-1.66,-9.01,-9.84],[-1.31,-10.5,-10.69],[1.23,-9.5,-9.5],[4.23,-10.5,-11.49],[6.78,-9.5,-10.3],[9.78,-10.5,-12.28],[9.37,-11.18,-13.27],[4.6,-9.56,-8.15],[3.82,-10.5,-9.82],[7.03,-9.5,-7.21],[8.92,-10.5,-7.5],[12.13,-9.5,-4.88],[14.01,-10.5,-5.17],[13.32,-9.97,-5.09],[8.97,-9.94,-6.41],[7.74,-10.5,-5.84],[10.6,-9.5,-2.62],[10.77,-10.5,-1.13],[13.63,-9.5,2.09],[13.79,-10.5,3.58]],"ss":["helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet","coil","coil","sheet","sheet","sheet","sheet","sheet"],"res":["ASP","ALA","HIS","GLY","GLY","CYS","ASP","TRP","ASN","TYR","PHE","ARG","ALA","ASN","GLN","GLY","THR","HIS","ALA","GLU","PHE","LEU","HIS","CYS","HIS","ARG","PRO","TRP","ASP","MET","ASN","ARG","GLY","ILE","ASN","GLY","ASP","MET","ASN","VAL","GLU","TRP","GLY","GLU","PRO","ARG","GLY","ARG","LEU","MET","HIS","ASN","PRO","CYS","HIS","CYS","GLY","TRP","TRP","THR","SER","ASN","ARG","ASP","CYS","GLU","TRP","ALA","ASP","TRP","HIS","LEU","ASP","GLU","THR","ASP","ILE","THR","VAL","GLN","LEU","SER","ALA","ASP","LYS","ILE","GLY"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A"]},"1BL8":{"atoms":[[9.5,-15.0,0.0],[7.74,-13.2,1.48],[6.59,-11.4,-0.51],[8.75,-9.6,-1.3],[9.15,-7.8,0.96],[6.85,-6.0,0.96],[7.25,-4.2,-1.3],[9.41,-2.4,-0.51],[7.79,-15.0,5.42],[5.54,-13.2,5.87],[5.48,-11.4,3.58],[7.75,-9.6,3.92],[7.02,-7.8,6.1],[5.0,-6.0,5.0],[6.44,-4.2,3.2],[7.96,-2.4,4.93],[3.28,-15.0,8.87],[1.09,-13.2,8.19],[2.14,-11.4,6.15],[3.97,-9.6,7.54],[2.28,-7.8,9.1],[1.04,-6.0,7.16],[3.16,-4.2,6.28],[3.67,-2.4,8.52],[-2.37,-15.0,9.1],[-3.96,-13.2,7.45],[-2.06,-11.4,6.17],[-1.12,-9.6,8.26],[-3.35,-7.8,8.82],[-3.52,-6.0,6.53],[-1.23,-4.2,6.77],[-1.86,-2.4,8.98],[-7.1,-15.0,6.07],[-7.71,-13.2,3.85],[-5.42,-11.4,3.63],[-5.6,-9.6,5.92],[-7.83,-7.8,5.35],[-6.87,-6.0,3.26],[-4.98,-4.2,4.56],[-6.59,-2.4,6.2],[-9.2,-15.0,0.9],[-8.68,-13.2,-1.34],[-6.56,-11.4,-0.43],[-7.82,-9.6,1.49],[-9.5,-7.8,-0.08],[-7.66,-6.0,-1.46],[-6.62,-4.2,0.59],[-8.82,-2.4,1.25],[-7.96,-15.0,-4.49],[-6.42,-13.2,-6.2],[-5.0,-11.4,-4.39],[-7.03,-9.6,-3.31],[-7.75,-7.8,-5.49],[-5.47,-6.0,-5.82],[-5.55,-4.2,-3.52],[-7.8,-2.4,-4.0],[-3.88,-15.0,-8.13],[-1.71,-13.2,-8.9],[-1.33,-11.4,-6.63],[-3.63,-9.6,-6.66],[-3.21,-7.8,-8.91],[-1.06,-6.0,-8.11],[-2.23,-4.2,-6.13],[-3.97,-2.4,-7.62],[1.49,-15.0,-8.74],[3.76,-13.2,-8.38],[3.01,-11.4,-6.21],[1.0,-9.6,-7.33],[2.45,-7.8,-9.11],[3.95,-6.0,-7.37],[1.98,-4.2,-6.19],[1.16,-2.4,-8.34],[6.16,-15.0,-6.17],[7.97,-13.2,-4.76],[6.27,-11.4,-3.22],[5.04,-9.6,-5.16],[7.17,-7.8,-6.03],[7.66,-6.0,-3.78],[5.36,-4.2,-3.7],[5.67,-2.4,-5.97],[-15.57,7.5,-5.57],[-12.1,8.5,-2.1],[-10.9,7.5,-0.9],[-7.43,8.5,2.57],[-10.77,7.5,-5.21],[-8.37,8.5,-1.61],[-9.06,7.5,1.17],[-6.66,8.5,4.77],[-5.77,7.5,-4.79],[-5.08,8.5,-2.02],[-7.48,7.5,1.58],[-6.79,8.5,4.36],[14.0,10.0,8.0],[11.65,11.6,9.97],[10.12,13.2,7.32],[13.0,14.8,6.27],[13.53,16.4,9.29],[10.47,18.0,9.29],[7.31,11.5,12.4],[7.04,12.5,14.46],[4.01,11.5,18.12],[3.74,12.5,20.17],[0.97,-0.47,0.57],[-7.59,3.85,-1.59],[-14.01,8.11,-4.56]],"ss":["helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","helix","helix","helix","helix","helix","helix","sheet","sheet","sheet","sheet","coil","coil","coil"],"res":["ARG","GLY","TYR","ASN","ASN","SER","ASN","TRP","CYS","CYS","SER","TRP","GLU","HIS","THR","VAL","PHE","GLN","TRP","GLN","ILE","MET","LYS","PRO","THR","PRO","ASP","GLY","GLY","ASN","LEU","ALA","TYR","TRP","GLY","TYR","GLY","ALA","ASN","ARG","GLY","ASN","ARG","LEU","ASN","THR","GLY","HIS","SER","GLN","TRP","CYS","TYR","TYR","SER","GLY","SER","PHE","GLN","ASP","ASP","PHE","LYS","PHE","PHE","PRO","ARG","ASP","ARG","MET","LEU","ASP","GLY","GLN","GLN","TRP","PRO","CYS","PHE","GLU","HIS","PRO","GLY","ASN","PRO","TRP","ASP","ARG","TRP","ALA","ASN","GLY","GLU","PHE","SER","SER","GLN","MET","ARG","GLU","MET","ALA","CYS","GLN","ILE"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A"]},"6LU7":{"atoms":[[17.0,-0.5,-0.8],[19.5,0.5,0.8],[22.0,-0.5,-0.8],[24.5,0.5,0.8],[13.81,-0.5,3.93],[16.44,0.5,6.9],[16.31,-0.5,8.26],[18.94,0.5,11.23],[8.81,-0.5,4.73],[8.94,0.5,6.1],[6.31,-0.5,9.06],[6.44,0.5,10.43],[7.0,-0.5,0.8],[4.5,0.5,-0.8],[2.0,-0.5,0.8],[-0.5,0.5,-0.8],[10.19,-0.5,-3.93],[7.56,0.5,-6.9],[7.69,-0.5,-8.26],[5.06,0.5,-11.23],[15.19,-0.5,-4.73],[15.06,0.5,-6.1],[17.69,-0.5,-9.06],[17.56,0.5,-10.43],[16.73,11.5,-0.75],[19.62,12.5,1.61],[21.42,11.5,0.96],[12.75,11.5,4.78],[14.26,12.5,7.23],[12.57,11.5,9.78],[7.73,11.5,3.71],[5.77,12.5,2.86],[2.93,11.5,5.09],[8.62,11.5,-2.49],[5.89,12.5,-5.46],[5.82,11.5,-6.64],[14.18,11.5,-5.25],[14.45,12.5,-6.23],[17.25,11.5,-9.19],[16.5,22.0,0.0],[14.74,23.4,1.48],[13.59,24.8,-0.51],[15.75,26.2,-1.3],[16.15,27.6,0.96],[12.81,22.0,4.26],[10.62,23.4,3.58],[11.67,24.8,1.54],[13.5,26.2,2.93],[11.81,27.6,4.49],[8.38,22.0,1.36],[7.77,23.4,-0.85],[10.05,24.8,-1.07],[9.87,26.2,1.22],[7.65,27.6,0.64],[10.52,22.0,-2.79],[12.05,23.4,-4.5],[13.47,24.8,-2.69],[11.44,26.2,-1.61],[10.73,27.6,-3.79],[12.76,5.74,-0.68],[12.67,12.41,0.22],[-7.0,-0.5,-0.8],[-4.5,0.5,0.8],[-2.0,-0.5,-0.8],[0.5,0.5,0.8],[-10.19,-0.5,3.93],[-7.56,0.5,6.9],[-7.69,-0.5,8.26],[-5.06,0.5,11.23],[-15.19,-0.5,4.73],[-15.06,0.5,6.1],[-17.69,-0.5,9.06],[-17.56,0.5,10.43],[-17.0,-0.5,0.8],[-19.5,0.5,-0.8],[-22.0,-0.5,0.8],[-24.5,0.5,-0.8],[-13.81,-0.5,-3.93],[-16.44,0.5,-6.9],[-16.31,-0.5,-8.26],[-18.94,0.5,-11.23],[-8.81,-0.5,-4.73],[-8.94,0.5,-6.1],[-6.31,-0.5,-9.06],[-6.44,0.5,-10.43],[-7.27,11.5,-0.75],[-4.38,12.5,1.61],[-2.58,11.5,0.96],[-11.25,11.5,4.78],[-9.74,12.5,7.23],[-11.43,11.5,9.78],[-16.27,11.5,3.71],[-18.23,12.5,2.86],[-21.07,11.5,5.09],[-15.38,11.5,-2.49],[-18.11,12.5,-5.46],[-18.18,11.5,-6.64],[-9.82,11.5,-5.25],[-9.55,12.5,-6.23],[-6.75,11.5,-9.19],[-7.5,22.0,0.0],[-9.26,23.4,1.48],[-10.41,24.8,-0.51],[-8.25,26.2,-1.3],[-7.85,27.6,0.96],[-11.19,22.0,4.26],[-13.38,23.4,3.58],[-12.33,24.8,1.54],[-10.5,26.2,2.93],[-12.19,27.6,4.49],[-15.62,22.0,1.36],[-16.23,23.4,-0.85],[-13.95,24.8,-1.07],[-14.13,26.2,1.22],[-16.35,27.6,0.64],[-13.48,22.0,-2.79],[-11.95,23.4,-4.5],[-10.53,24.8,-2.69],[-12.56,26.2,-1.61],[-13.27,27.6,-3.79],[-11.27,6.95,0.62],[-11.24,11.05,0.47]],"ss":["sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil"],"res":["GLN","ARG","TYR","TRP","ARG","LEU","ARG","ARG","TYR","SER","THR","THR","GLU","ARG","THR","ASN","GLU","ASN","VAL","ASN","GLY","MET","ASP","TYR","GLY","TYR","VAL","ARG","VAL","ASN","PHE","TYR","TYR","THR","LEU","HIS","GLN","LEU","GLY","HIS","MET","CYS","ILE","PRO","LEU","ASN","ALA","PRO","VAL","TYR","ASP","ASN","TRP","GLN","THR","HIS","CYS","LYS","ASN","THR","ALA","TRP","ILE","ASP","CYS","HIS","ASP","ASP","TRP","CYS","HIS","ILE","VAL","GLN","LEU","GLN","HIS","THR","SER","HIS","ARG","ASN","PHE","HIS","ARG","ALA","LEU","CYS","HIS","GLU","PRO","TRP","PHE","TRP","ALA","ASP","ASN","CYS","TRP","ARG","LYS","TYR","TRP","CYS","PHE","CYS","ARG","ILE","LYS","ARG","LYS","GLN","GLY","ASP","LYS","TRP","PHE","VAL","CYS","GLY","LEU","PHE"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B"]},"3C1E":{"atoms":[[2.0,0.0,0.0],[-0.35,1.5,1.97],[-1.88,3.0,-0.68],[1.0,4.5,-1.73],[1.53,6.0,1.29],[-1.53,7.5,1.29],[-1.0,9.0,-1.73],[1.88,10.5,-0.68],[7.08,0.0,1.68],[4.15,1.5,0.77],[5.56,3.0,-1.95],[8.0,4.5,-0.09],[5.75,6.0,1.98],[4.09,7.5,-0.59],[6.92,9.0,-1.78],[7.59,10.5,1.21],[-0.83,0.0,7.82],[-1.65,1.5,4.86],[1.4,3.0,4.58],[1.16,4.5,7.63],[-1.81,6.0,6.86],[-0.53,7.5,4.07],[1.99,9.0,5.81],[-0.16,10.5,7.99],[4.02,0.0,6.28],[6.07,1.5,4.0],[7.96,3.0,6.41],[5.25,4.5,7.86],[4.3,6.0,4.94],[7.34,7.5,4.51],[7.23,9.0,7.57],[4.24,10.5,6.94],[-8.14,-0.5,-2.79],[-4.91,0.5,-0.69],[-2.23,-0.5,-1.75],[1.0,0.5,0.35],[3.68,-0.5,-0.7],[-8.21,3.0,-1.77],[-4.9,4.0,0.55],[-2.41,3.0,-0.22],[0.9,4.0,2.1],[3.38,3.0,1.33],[-8.27,6.5,-0.75],[-4.91,7.5,1.78],[-2.64,6.5,1.3],[0.73,7.5,3.83],[3.0,6.5,3.35],[-8.34,10.0,0.27],[-4.94,11.0,2.99],[-2.9,10.0,2.81],[0.49,11.0,5.53],[2.54,10.0,5.35],[5.73,11.14,0.33],[-1.34,5.63,-0.3],[-7.56,-0.4,-2.38],[-7.61,14.11,2.38],[0.33,-0.24,0.5]],"ss":["helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","coil","coil","coil","coil","coil"],"res":["GLY","HIS","GLU","ASP","MET","ARG","SER","GLY","GLN","PRO","LYS","ILE","GLY","GLY","ALA","GLN","MET","LEU","HIS","ASN","HIS","LYS","THR","MET","TRP","LEU","ALA","ASP","HIS","GLU","TYR","HIS","ARG","ASP","VAL","PHE","LYS","LEU","PHE","VAL","THR","ASP","MET","TYR","GLN","HIS","ARG","PHE","ALA","THR","TRP","GLN","PHE","LEU","MET","GLU","VAL"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A"]},"5XSY":{"atoms":[[-7.0,0.0,0.0],[-9.35,1.5,1.97],[-10.88,3.0,-0.68],[-8.0,4.5,-1.73],[-7.47,6.0,1.29],[-10.53,7.5,1.29],[-10.0,9.0,-1.73],[-10.47,0.0,6.48],[-13.53,1.5,6.48],[-13.0,3.0,3.46],[-10.12,4.5,4.52],[-11.66,6.0,7.17],[-14.0,7.5,5.19],[-11.65,9.0,3.23],[-17.66,0.0,7.17],[-20.0,1.5,5.19],[-17.65,3.0,3.23],[-16.12,4.5,5.89],[-19.01,6.0,6.92],[-19.53,7.5,3.9],[-16.46,9.0,3.92],[-22.01,0.0,1.73],[-22.52,1.5,-1.29],[-19.46,3.0,-1.28],[-20.01,4.5,1.74],[-22.88,6.0,0.67],[-21.34,7.5,-1.97],[-19.0,9.0,0.01],[-19.88,0.0,-4.53],[-18.33,1.5,-7.17],[-16.0,3.0,-5.18],[-18.36,4.5,-3.23],[-19.87,6.0,-5.89],[-16.99,7.5,-6.92],[-16.48,9.0,-3.9],[-13.87,0.0,-5.9],[-10.98,1.5,-6.92],[-10.48,3.0,-3.9],[-13.54,4.5,-3.92],[-12.98,6.0,-6.94],[-10.11,7.5,-5.86],[-11.67,9.0,-3.22],[16.8,0.0,-8.0],[14.69,1.6,-6.23],[13.31,3.2,-8.62],[15.9,4.8,-9.56],[16.38,6.4,-6.84],[13.62,8.0,-6.84],[15.97,12.0,-3.49],[13.34,13.6,-4.31],[14.6,15.2,-6.76],[16.8,16.8,-5.08],[14.77,18.4,-3.21],[13.28,20.0,-5.54],[14.25,24.0,-0.36],[13.52,25.6,-3.02],[16.26,27.2,-3.28],[16.04,28.8,-0.53],[13.37,30.4,-1.23],[14.52,32.0,-3.74],[13.22,36.0,1.25],[15.06,37.6,-0.8],[16.76,39.2,1.37],[14.33,40.8,2.67],[13.47,42.4,0.05],[16.2,44.0,-0.34],[9.31,4.5,9.6],[12.09,5.5,12.82],[12.11,4.5,14.45],[14.89,5.5,17.67],[9.2,12.5,10.0],[10.8,13.5,12.8],[9.2,12.5,15.6],[10.8,13.5,18.4],[9.31,20.5,10.4],[9.29,21.5,12.02],[6.51,20.5,15.25],[6.49,21.5,16.87],[1.2,5.0,0.0],[-0.21,6.8,1.18],[-1.13,8.6,-0.41],[0.6,10.4,-1.04],[0.92,12.2,0.77],[-0.92,14.0,0.77],[-0.6,15.8,-1.04],[1.13,17.6,-0.41],[0.21,19.4,1.18],[-1.2,21.2,0.0],[-15.72,9.46,0.39],[-4.59,5.8,-2.85],[5.09,3.16,-5.92],[14.84,0.81,-7.83]],"ss":["helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","coil"],"res":["TYR","ILE","MET","TRP","ALA","ILE","ILE","GLN","PHE","TYR","VAL","LEU","PRO","PRO","PRO","GLN","THR","SER","GLU","ASN","ILE","THR","VAL","LEU","ASN","GLY","ILE","GLY","GLN","CYS","ALA","ARG","GLY","SER","VAL","ASN","PRO","PHE","TYR","GLN","MET","SER","MET","GLY","CYS","ALA","ASP","PHE","GLY","GLU","THR","PRO","ARG","TRP","GLY","ASP","PRO","CYS","PRO","THR","TRP","VAL","LEU","PRO","VAL","THR","PHE","TRP","PRO","GLU","SER","PRO","HIS","GLY","HIS","THR","SER","GLY","HIS","PRO","ASN","ILE","GLY","HIS","LEU","LEU","TRP","ASN","ALA","TYR","MET","SER"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A"]},"7A6A":{"atoms":[[19.0,19.5,-0.8],[21.5,20.5,0.8],[24.0,19.5,-0.8],[26.5,20.5,0.8],[17.27,23.5,2.26],[20.22,24.5,5.09],[21.1,23.5,5.47],[24.05,24.5,8.3],[14.1,27.5,3.86],[16.11,28.5,6.6],[14.96,27.5,8.78],[16.97,28.5,11.52],[11.0,-10.0,0.0],[9.24,-8.0,1.48],[8.09,-6.0,-0.51],[10.25,-4.0,-1.3],[10.65,-2.0,0.96],[8.35,0.0,0.96],[8.75,2.0,-1.3],[10.91,4.0,-0.51],[6.31,-10.0,1.26],[4.12,-8.0,0.58],[5.17,-6.0,-1.46],[7.0,-4.0,-0.07],[5.31,-2.0,1.49],[4.07,0.0,-0.45],[6.19,2.0,-1.33],[6.69,4.0,0.91],[14.17,19.86,0.73],[10.61,12.52,-0.35],[7.41,5.68,0.76],[-9.5,19.5,15.65],[-7.0,20.5,17.25],[-4.5,19.5,15.65],[-2.0,20.5,17.25],[-11.89,23.5,13.36],[-8.95,24.5,16.19],[-8.06,23.5,16.57],[-5.12,24.5,19.4],[-11.69,27.5,10.75],[-9.68,28.5,13.49],[-10.82,27.5,15.68],[-8.81,28.5,18.42],[-3.94,-10.0,9.49],[-6.13,-8.0,8.81],[-5.08,-6.0,6.76],[-3.25,-4.0,8.16],[-4.94,-2.0,9.72],[-6.18,0.0,7.78],[-4.06,2.0,6.89],[-3.56,4.0,9.14],[-3.37,-10.0,6.13],[-3.98,-8.0,3.91],[-1.7,-6.0,3.69],[-1.88,-4.0,5.99],[-4.1,-2.0,5.41],[-3.15,0.0,3.32],[-1.26,2.0,4.62],[-2.87,4.0,6.26],[-6.94,19.33,12.61],[-5.47,13.86,9.89],[-2.93,5.75,7.38],[-9.5,19.5,-17.25],[-7.0,20.5,-15.65],[-4.5,19.5,-17.25],[-2.0,20.5,-15.65],[-6.92,23.5,-17.45],[-3.98,24.5,-14.62],[-3.09,23.5,-14.24],[-0.15,24.5,-11.4],[-4.77,27.5,-15.03],[-2.76,28.5,-12.29],[-3.9,27.5,-10.1],[-1.89,28.5,-7.36],[-5.37,-10.0,-6.86],[-5.98,-8.0,-9.08],[-3.7,-6.0,-9.3],[-3.88,-4.0,-7.0],[-6.1,-2.0,-7.58],[-5.15,0.0,-9.67],[-3.26,2.0,-8.37],[-4.87,4.0,-6.73],[-4.23,-10.0,-4.55],[-2.7,-8.0,-6.26],[-1.28,-6.0,-4.45],[-3.31,-4.0,-3.37],[-4.02,-2.0,-5.56],[-1.75,0.0,-5.88],[-1.82,2.0,-3.58],[-4.07,4.0,-4.06],[-6.95,19.93,-12.34],[-5.44,12.64,-10.25],[-2.88,5.56,-6.59]],"ss":["sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","sheet","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","helix","coil","coil","coil"],"res":["ALA","LYS","ILE","MET","PHE","TRP","TRP","VAL","GLY","SER","GLY","HIS","PHE","SER","ALA","MET","LEU","MET","GLU","PRO","CYS","VAL","TRP","ALA","MET","TYR","TYR","ALA","HIS","PHE","HIS","ASN","SER","ALA","TRP","ARG","LYS","GLY","ASN","ARG","ALA","GLY","GLN","ALA","VAL","CYS","GLY","CYS","SER","ASP","TYR","GLN","PRO","HIS","LYS","GLU","VAL","VAL","ASP","GLN","ASN","TYR","GLY","ASP","ILE","VAL","ASP","TYR","ARG","LYS","TRP","PHE","LYS","ASN","THR","LEU","ALA","PHE","SER","ASP","PHE","LYS","PRO","CYS","PHE","GLU","THR","HIS","VAL","TRP","PRO","TYR","VAL"],"chains":["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","B","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C","C"]}};

// ── PDB Parser ──
function parsePDB(text){
  const atoms=[],ss=[],res=[],chains=[];
  const helixRanges=[],sheetRanges=[];
  for(const line of text.split("\n")){
    if(line.startsWith("HELIX")){
      const ch=line.substring(19,20).trim();
      const s=parseInt(line.substring(21,25));
      const e=parseInt(line.substring(33,37));
      if(!isNaN(s)&&!isNaN(e))helixRanges.push({ch,s,e});
    }else if(line.startsWith("SHEET")){
      const ch=line.substring(21,22).trim();
      const s=parseInt(line.substring(22,26));
      const e=parseInt(line.substring(33,37));
      if(!isNaN(s)&&!isNaN(e))sheetRanges.push({ch,s,e});
    }
  }
  for(const line of text.split("\n")){
    if((line.startsWith("ATOM")||line.startsWith("HETATM"))&&line.substring(12,16).trim()==="CA"){
      const x=parseFloat(line.substring(30,38));
      const y=parseFloat(line.substring(38,46));
      const z=parseFloat(line.substring(46,54));
      const rn=line.substring(17,20).trim();
      const ch=line.substring(21,22).trim();
      const rseq=parseInt(line.substring(22,26));
      if(isNaN(x)||isNaN(y)||isNaN(z))continue;
      atoms.push([x,y,z]);
      res.push(rn);
      chains.push(ch);
      let ssType="coil";
      for(const h of helixRanges){if(h.ch===ch&&rseq>=h.s&&rseq<=h.e){ssType="helix";break;}}
      if(ssType==="coil")for(const s of sheetRanges){if(s.ch===ch&&rseq>=s.s&&rseq<=s.e){ssType="sheet";break;}}
      ss.push(ssType);
    }
  }
  return{atoms,ss,res,chains};
}

// ── Proteins list ──
const PRESETS=[
  {id:"1CRN",name:"Crambin",desc:"植物种子蛋白",arch:"微型独栋住宅",archDetail:"紧凑高效，两根承重柱撑起主体结构，一片楼板分隔上下空间。"},
  {id:"1UBQ",name:"Ubiquitin",desc:"泛素",arch:"模块化社区中心",archDetail:"多层楼板围合出中庭空间，贯穿的柱廊支撑整体。"},
  {id:"4HHB",name:"Hemoglobin",desc:"血红蛋白·四聚体",arch:"交通枢纽综合体",archDetail:"四座塔楼围绕中央广场对称排列，共享核心服务区。"},
  {id:"1BNA",name:"DNA双螺旋",desc:"B型DNA",arch:"双螺旋观光塔",archDetail:"两条螺旋坡道互相缠绕上升，极致的空间效率。"},
  {id:"1EMA",name:"GFP",desc:"绿色荧光蛋白",arch:"圆筒形展览馆",archDetail:"β桶状外壁围合出中庭，中央螺旋立柱承托天窗，光从核心辐射而出。"},
  {id:"1BL8",name:"Ca²⁺-ATPase",desc:"钙离子泵",arch:"跨层工业综合体",archDetail:"十根跨膜立柱深入地下，地上伸出三个功能体块，泵送离子如同工业流水线。"},
  {id:"6LU7",name:"Mpro",desc:"新冠主蛋白酶",arch:"对称双子塔",archDetail:"两座镜像塔楼共享地基，各含三层功能区：底层仓储、中层办公、顶层设备间。"},
  {id:"3C1E",name:"Lysozyme",desc:"溶菌酶变体",arch:"古典庭院式宅院",archDetail:"四柱回廊围合中庭，一侧连接多层板式附楼，传统与功能的平衡。"},
  {id:"5XSY",name:"Cas9",desc:"基因剪刀",arch:"科研园区",archDetail:"大型综合科研园区，识别区与核酸酶区分居两翼，中央桥廊贯穿南北。"},
  {id:"7A6A",name:"Spike",desc:"刺突蛋白三聚体",arch:"三叶草会展中心",archDetail:"三座展厅120°对称排列，底部由螺旋柱群支撑，顶部各自展开成独立展区。"},
];

// ── Scene builders ──
function getSegments(data){
  const{ss,chains}=data;const segs=[];let cur=ss[0],ch=chains[0],s=0;
  for(let i=1;i<=ss.length;i++){
    if(i===ss.length||ss[i]!==cur||chains[i]!==ch){segs.push({type:cur,chain:ch,start:s,end:i-1});if(i<ss.length){cur=ss[i];ch=chains[i];s=i;}}
  }return segs;
}

function buildProtein(grp,data,cx,cy,cz){
  const{atoms,ss,chains}=data;
  for(let i=0;i<atoms.length-1;i++){
    if(chains[i]!==chains[i+1])continue;
    const isH=ss[i]==="helix",isS=ss[i]==="sheet";
    const color=isH?0x2dd4bf:isS?0xf59e0b:0x6b7280;
    const s=new THREE.Vector3(atoms[i][0]-cx,atoms[i][1]-cy,atoms[i][2]-cz);
    const e=new THREE.Vector3(atoms[i+1][0]-cx,atoms[i+1][1]-cy,atoms[i+1][2]-cz);
    const mid=new THREE.Vector3().addVectors(s,e).multiplyScalar(0.5);
    const dir=new THREE.Vector3().subVectors(e,s);const len=dir.length();
    const rad=isH?0.7:isS?0.5:0.3;
    const geo=isS?new THREE.BoxGeometry(1,len,0.4):new THREE.CylinderGeometry(rad,rad,len,isH?8:6);
    const mat=new THREE.MeshPhongMaterial({color,shininess:80,transparent:true,opacity:0.92});
    const mesh=new THREE.Mesh(geo,mat);mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());grp.add(mesh);
  }
  atoms.forEach((a,i)=>{
    const isH=ss[i]==="helix",isS=ss[i]==="sheet";
    const color=isH?0x2dd4bf:isS?0xf59e0b:0x6b7280;
    const r=isH?0.85:isS?0.65:0.4;
    const geo=new THREE.SphereGeometry(r,8,6);
    const mat=new THREE.MeshPhongMaterial({color,shininess:80,transparent:true,opacity:0.92});
    const mesh=new THREE.Mesh(geo,mat);mesh.position.set(a[0]-cx,a[1]-cy,a[2]-cz);grp.add(mesh);
  });
}

function buildArch(grp,data,cx,cy,cz,maxD){
  const{atoms}=data;const segs=getSegments(data);
  const groundY=-maxD*0.65;
  const colC=0xd4c5a0,slabC=0x7a8a6b,wallC=0x5a6a4b,corrC=0x8a8a8a,glassC=0x88bbdd,roofC=0x4a5a3b;

  // Ground
  const gGeo=new THREE.CircleGeometry(maxD*1.5,64);
  const gMat=new THREE.MeshPhongMaterial({color:0x2a3520,shininess:5,side:THREE.DoubleSide});
  const gnd=new THREE.Mesh(gGeo,gMat);gnd.rotation.x=-Math.PI/2;gnd.position.y=groundY;grp.add(gnd);
  for(let i=-6;i<=6;i++){
    const lG=new THREE.BoxGeometry(maxD*3,0.02,0.04);
    const lM=new THREE.MeshBasicMaterial({color:0x3a4530,transparent:true,opacity:0.4});
    const l1=new THREE.Mesh(lG,lM);l1.position.set(0,groundY+0.02,i*maxD*0.22);grp.add(l1);
    const l2=new THREE.Mesh(lG.clone(),lM.clone());l2.rotation.y=Math.PI/2;l2.position.set(i*maxD*0.22,groundY+0.02,0);grp.add(l2);
  }

  // Foundation per chain
  const cg={};segs.forEach(s=>{if(!cg[s.chain])cg[s.chain]=[];cg[s.chain].push(s)});
  Object.values(cg).forEach(cs=>{
    let mnx=Infinity,mxx=-Infinity,mnz=Infinity,mxz=-Infinity;
    cs.forEach(s=>{for(let i=s.start;i<=s.end;i++){const a=atoms[i];const x=a[0]-cx,z=a[2]-cz;if(x<mnx)mnx=x;if(x>mxx)mxx=x;if(z<mnz)mnz=z;if(z>mxz)mxz=z;}});
    const p=2;const fG=new THREE.BoxGeometry(mxx-mnx+p*2,0.3,mxz-mnz+p*2);
    const fM=new THREE.MeshPhongMaterial({color:0x4a4a3a,shininess:10,transparent:true,opacity:0.6});
    const f=new THREE.Mesh(fG,fM);f.position.set((mnx+mxx)/2,groundY+0.15,(mnz+mxz)/2);grp.add(f);
  });

  segs.forEach(seg=>{
    const sa=atoms.slice(seg.start,seg.end+1).map(a=>[a[0]-cx,a[1]-cy,a[2]-cz]);
    if(sa.length<2)return;
    const first=sa[0],last=sa[sa.length-1];
    const scx=(first[0]+last[0])/2,scz=(first[2]+last[2])/2;
    const dx=last[0]-first[0],dy=last[1]-first[1],dz=last[2]-first[2];
    const hLen=Math.sqrt(dx*dx+dz*dz),vLen=Math.sqrt(dx*dx+dy*dy+dz*dz);

    if(seg.type==="helix"){
      const nF=Math.max(2,Math.ceil(sa.length/3));
      const fH=vLen/nF;const fp=Math.max(3,hLen*0.3+2);
      const cR=0.35;const offs=[[-1,-1],[1,-1],[1,1],[-1,1]];
      const hf=fp/2;const ang=Math.atan2(dz,dx);
      offs.forEach(([ox,oz])=>{
        const rx=ox*hf*Math.cos(ang)-oz*hf*Math.sin(ang);
        const rz=ox*hf*Math.sin(ang)+oz*hf*Math.cos(ang);
        const cG=new THREE.CylinderGeometry(cR,cR+0.05,nF*fH,8);
        const cM=new THREE.MeshPhongMaterial({color:colC,shininess:40});
        const c=new THREE.Mesh(cG,cM);c.position.set(scx+rx,groundY+nF*fH/2+0.3,scz+rz);grp.add(c);
        const cpG=new THREE.CylinderGeometry(cR+0.3,cR,0.25,8);
        const cpM=new THREE.MeshPhongMaterial({color:0xbab09a,shininess:60});
        const cp=new THREE.Mesh(cpG,cpM);cp.position.set(scx+rx,groundY+nF*fH+0.42,scz+rz);grp.add(cp);
      });
      for(let f=0;f<=nF;f++){
        const sG=new THREE.BoxGeometry(fp+0.8,0.2,fp+0.8);
        const sM=new THREE.MeshPhongMaterial({color:slabC,shininess:20,transparent:true,opacity:0.85});
        const sl=new THREE.Mesh(sG,sM);sl.position.set(scx,groundY+f*fH+0.3,scz);sl.rotation.y=ang;grp.add(sl);
      }
      for(let f=0;f<nF;f++){
        [0,2].forEach(ci=>{
          const[ox,oz]=offs[ci];const rx=ox*hf*Math.cos(ang)-oz*hf*Math.sin(ang);const rz=ox*hf*Math.sin(ang)+oz*hf*Math.cos(ang);
          const[ox2,oz2]=offs[ci+1];const rx2=ox2*hf*Math.cos(ang)-oz2*hf*Math.sin(ang);const rz2=ox2*hf*Math.sin(ang)+oz2*hf*Math.cos(ang);
          const wL=Math.sqrt((rx2-rx)**2+(rz2-rz)**2);const wA=Math.atan2(rz2-rz,rx2-rx);
          const wG=new THREE.BoxGeometry(wL,fH*0.75,0.08);
          const wM=new THREE.MeshPhongMaterial({color:glassC,shininess:100,transparent:true,opacity:0.25});
          const w=new THREE.Mesh(wG,wM);w.position.set(scx+(rx+rx2)/2,groundY+f*fH+fH*0.5+0.3,scz+(rz+rz2)/2);w.rotation.y=-wA;grp.add(w);
        });
      }
      const rG=new THREE.ConeGeometry(fp*0.7,fH*0.6,4);
      const rM=new THREE.MeshPhongMaterial({color:roofC,shininess:15,transparent:true,opacity:0.8});
      const rf=new THREE.Mesh(rG,rM);rf.position.set(scx,groundY+nF*fH+fH*0.3+0.3,scz);rf.rotation.y=ang+Math.PI/4;grp.add(rf);
    }else if(seg.type==="sheet"){
      let mnx=Infinity,mxx=-Infinity,mnz=Infinity,mxz=-Infinity,mny=Infinity,mxy=-Infinity;
      sa.forEach(a=>{if(a[0]<mnx)mnx=a[0];if(a[0]>mxx)mxx=a[0];if(a[2]<mnz)mnz=a[2];if(a[2]>mxz)mxz=a[2];if(a[1]<mny)mny=a[1];if(a[1]>mxy)mxy=a[1];});
      const pd=1.5;const w=Math.max(mxx-mnx+pd*2,4),d=Math.max(mxz-mnz+pd*2,4);
      const h=Math.max(2.5,Math.min(5,(mxy-mny)*0.4));const bcx=(mnx+mxx)/2,bcz=(mnz+mxz)/2;
      const bG=new THREE.BoxGeometry(w,h,d);const bM=new THREE.MeshPhongMaterial({color:wallC,shininess:15,transparent:true,opacity:0.75});
      const b=new THREE.Mesh(bG,bM);b.position.set(bcx,groundY+h/2+0.3,bcz);grp.add(b);
      const roG=new THREE.BoxGeometry(w+2,0.15,d+2);const roM=new THREE.MeshPhongMaterial({color:slabC,shininess:20});
      const ro=new THREE.Mesh(roG,roM);ro.position.set(bcx,groundY+h+0.38,bcz);grp.add(ro);
      const nW=Math.max(2,Math.floor(w/3));
      for(let wi=0;wi<nW;wi++){const wx=mnx+pd+(wi+0.5)*(w-pd*2)/nW;
        [-1,1].forEach(side=>{const wiG=new THREE.BoxGeometry((w-pd*2)/nW*0.6,h*0.5,0.12);
          const wiM=new THREE.MeshPhongMaterial({color:glassC,shininess:120,transparent:true,opacity:0.35});
          const wi2=new THREE.Mesh(wiG,wiM);wi2.position.set(wx,groundY+h*0.55+0.3,bcz+side*d/2);grp.add(wi2);});}
      const dG=new THREE.BoxGeometry(1.5,2,0.15);const dM=new THREE.MeshPhongMaterial({color:0x5a3a2a,shininess:30});
      const dr=new THREE.Mesh(dG,dM);dr.position.set(bcx,groundY+1.3,bcz+d/2+0.08);grp.add(dr);
    }else{
      for(let i=0;i<sa.length-1;i++){
        const a1=sa[i],a2=sa[i+1];
        const s=new THREE.Vector3(a1[0],groundY+1.5,a1[2]);const e=new THREE.Vector3(a2[0],groundY+1.5,a2[2]);
        const mid=new THREE.Vector3().addVectors(s,e).multiplyScalar(0.5);
        const dir=new THREE.Vector3().subVectors(e,s);const len=dir.length();if(len<0.1)continue;
        const wG=new THREE.BoxGeometry(1.8,0.15,len);const wM=new THREE.MeshPhongMaterial({color:corrC,shininess:15,transparent:true,opacity:0.8});
        const wk=new THREE.Mesh(wG,wM);wk.position.copy(mid);const ag=Math.atan2(dir.x,dir.z);wk.rotation.y=ag;grp.add(wk);
        [-1,1].forEach(side=>{const rG=new THREE.BoxGeometry(0.06,0.8,len);const rM=new THREE.MeshPhongMaterial({color:0x6a6a6a,shininess:30,transparent:true,opacity:0.6});
          const rl=new THREE.Mesh(rG,rM);rl.position.set(mid.x+side*0.85*Math.cos(ag),mid.y+0.4,mid.z-side*0.85*Math.sin(ag));rl.rotation.y=ag;grp.add(rl);});
        const pG=new THREE.CylinderGeometry(0.08,0.08,1.5,6);const pM=new THREE.MeshPhongMaterial({color:0x5a5a5a,shininess:20});
        [s,e].forEach(pt=>{const po=new THREE.Mesh(pG,pM);po.position.set(pt.x,groundY+0.75,pt.z);grp.add(po);});
      }
    }
  });
  // Trees
  for(let i=0;i<8;i++){const ag=i/8*Math.PI*2+0.3;const r=maxD*1.1+Math.random()*3;const tx=Math.cos(ag)*r,tz=Math.sin(ag)*r;
    const tG=new THREE.CylinderGeometry(0.15,0.2,2,6);const tM=new THREE.MeshPhongMaterial({color:0x5a4030});
    const tr=new THREE.Mesh(tG,tM);tr.position.set(tx,groundY+1,tz);grp.add(tr);
    const crG=new THREE.SphereGeometry(1+Math.random()*0.5,8,6);const crM=new THREE.MeshPhongMaterial({color:0x2a5a2a+Math.floor(Math.random()*0x101010),shininess:10});
    const cr=new THREE.Mesh(crG,crM);cr.position.set(tx,groundY+2.8,tz);grp.add(cr);
  }
}

function buildSceneCommon(canvas,data,mode){
  const w=canvas.clientWidth||1,h=canvas.clientHeight||1;
  const ren=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  ren.setPixelRatio(Math.min(window.devicePixelRatio,2));ren.setSize(w,h,false);
  ren.setClearColor(mode==="arch"?0x0d1a0d:0x000000,mode==="arch"?1:0);
  const scene=new THREE.Scene();if(mode==="arch")scene.fog=new THREE.Fog(0x0d1a0d,80,200);
  const cam=new THREE.PerspectiveCamera(50,w/h,0.1,2000);
  scene.add(new THREE.AmbientLight(0xffffff,mode==="arch"?0.4:0.5));
  const dl=new THREE.DirectionalLight(mode==="arch"?0xffeedd:0xffffff,0.8);dl.position.set(5,12,5);scene.add(dl);
  if(mode==="arch"){const d3=new THREE.DirectionalLight(0xffd0a0,0.3);d3.position.set(-8,6,-3);scene.add(d3);}
  const d2=new THREE.DirectionalLight(0x88ccff,0.25);d2.position.set(-5,-3,-5);scene.add(d2);
  const grp=new THREE.Group();scene.add(grp);
  const{atoms}=data;let cx=0,cy=0,cz=0;
  atoms.forEach(a=>{cx+=a[0];cy+=a[1];cz+=a[2]});cx/=atoms.length;cy/=atoms.length;cz/=atoms.length;
  let maxD=0;atoms.forEach(a=>{const d=Math.sqrt((a[0]-cx)**2+(a[1]-cy)**2+(a[2]-cz)**2);if(d>maxD)maxD=d});
  if(mode==="protein")buildProtein(grp,data,cx,cy,cz);else buildArch(grp,data,cx,cy,cz,maxD);
  cam.position.z=maxD*(mode==="arch"?3.2:2.8);
  if(mode==="arch"){cam.position.y=maxD*0.4;cam.lookAt(0,-maxD*0.2,0);}
  return{ren,scene,cam,grp,maxD};
}

function useScene(canvasRef,data,mode){
  const R=useRef({ren:null,frame:null,rot:{x:0.35,y:0},zoom:1,auto:true,m:{down:false,lx:0,ly:0},cam:null,lastW:0,lastH:0,peer:null});
  useEffect(()=>{
    const c=canvasRef.current;if(!c||!data||!data.atoms||data.atoms.length<2)return;
    const r=R.current;if(r.frame)cancelAnimationFrame(r.frame);if(r.ren){r.ren.dispose();r.ren=null;}
    r.rot={x:mode==="arch"?0.55:0.35,y:0};r.zoom=1;r.lastW=0;r.lastH=0;
    const{ren,scene,cam,grp,maxD}=buildSceneCommon(c,data,mode);
    r.ren=ren;r.cam=cam;r.auto=true;const cD=maxD*(mode==="arch"?3.2:2.8);const cY=mode==="arch"?maxD*0.4:0;const lookY=mode==="arch"?-maxD*0.2:0;
    const anim=()=>{
      r.frame=requestAnimationFrame(anim);
      const w=c.clientWidth,h=c.clientHeight;
      if(w>0&&h>0&&(w!==r.lastW||h!==r.lastH)){r.lastW=w;r.lastH=h;ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
      if(w<=0||h<=0)return;
      if(r.auto)r.rot.y+=0.003;grp.rotation.x=r.rot.x;grp.rotation.y=r.rot.y;cam.position.z=cD/r.zoom;cam.position.y=cY;cam.lookAt(0,lookY,0);ren.render(scene,cam);
    };
    anim();
    return()=>{if(r.frame)cancelAnimationFrame(r.frame)};
  },[data,mode,canvasRef]);

  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const r=R.current;
    const onD=e=>{r.m.down=true;const p=e.touches?e.touches[0]:e;r.m.lx=p.clientX;r.m.ly=p.clientY;r.auto=false;if(r.peer)r.peer.auto=false};
    const onM=e=>{if(!r.m.down)return;const p=e.touches?e.touches[0]:e;const dx=(p.clientX-r.m.lx)*0.01,dy=(p.clientY-r.m.ly)*0.01;r.rot.y+=dx;r.rot.x+=dy;if(r.peer){r.peer.rot.y+=dx;r.peer.rot.x+=dy}r.m.lx=p.clientX;r.m.ly=p.clientY};
    const onU=()=>{r.m.down=false};
    const onW=e=>{e.preventDefault();const nz=Math.max(0.3,Math.min(3,r.zoom+e.deltaY*-0.001));r.zoom=nz;if(r.peer)r.peer.zoom=nz};
    c.addEventListener("mousedown",onD);c.addEventListener("mousemove",onM);c.addEventListener("mouseup",onU);c.addEventListener("mouseleave",onU);
    c.addEventListener("touchstart",onD,{passive:true});c.addEventListener("touchmove",onM,{passive:true});c.addEventListener("touchend",onU);
    c.addEventListener("wheel",onW,{passive:false});
    return()=>{c.removeEventListener("mousedown",onD);c.removeEventListener("mousemove",onM);c.removeEventListener("mouseup",onU);c.removeEventListener("mouseleave",onU);c.removeEventListener("touchstart",onD);c.removeEventListener("touchmove",onM);c.removeEventListener("touchend",onU);c.removeEventListener("wheel",onW)};
  },[canvasRef]);
  return R;
}

function TabBtn({active,children,onClick,color}){
  return(<button onClick={onClick} style={{padding:"8px 16px",background:active?`${color}18`:"transparent",border:`1px solid ${active?`${color}66`:"rgba(255,255,255,0.07)"}`,borderRadius:"4px",color:active?color:"#737373",cursor:"pointer",fontSize:"13px",fontFamily:"'Courier New',monospace",fontWeight:active?600:400,transition:"all 0.2s",letterSpacing:"1px"}}>{children}</button>);
}

export default function App({ onBack }){
  const[selected,setSelected]=useState("4HHB");
  const[customData,setCustomData]=useState(null);
  const[customName,setCustomName]=useState("");
  const[activeView,setActiveView]=useState("both");
  const[showInfo,setShowInfo]=useState(true);
  const[pdbIdInput,setPdbIdInput]=useState("");
  const[loadingPdb,setLoadingPdb]=useState(false);
  const[loadError,setLoadError]=useState("");
  const pRef=useRef(null),aRef=useRef(null);

  const isCustom=selected==="custom";
  const data=isCustom?customData:BUILTIN_DATA[selected];
  const preset=PRESETS.find(p=>p.id===selected);

  const pSceneR=useScene(pRef,data,"protein");
  const aSceneR=useScene(aRef,data,"arch");
  useEffect(()=>{
    const p=pSceneR.current,a=aSceneR.current;
    if(activeView==="both"){p.peer=a;a.peer=p}else{p.peer=null;a.peer=null}
  },[activeView]);

  const nChains=data?[...new Set(data.chains)].length:0;
  const nHelix=data?data.ss.filter(s=>s==="helix").length:0;
  const nSheet=data?data.ss.filter(s=>s==="sheet").length:0;

  const handleFetchPdb=useCallback(async()=>{
    const id=pdbIdInput.trim().toUpperCase();
    if(!id||id.length<4){setLoadError("请输入4位PDB ID");return;}
    setLoadingPdb(true);setLoadError("");
    try{
      const resp=await fetch(`https://files.rcsb.org/download/${id}.pdb`);
      if(!resp.ok)throw new Error("not found");
      const text=await resp.text();
      const parsed=parsePDB(text);
      if(parsed.atoms.length<2)throw new Error("no atoms");
      setCustomData(parsed);setCustomName(id);setSelected("custom");
    }catch{setLoadError(`无法加载 ${id}，请检查ID或上传本地PDB文件`);}
    setLoadingPdb(false);
  },[pdbIdInput]);

  return(
    <div style={{width:"100%",height:"100vh",background:"#0a0a0a",color:"#e5e5e5",fontFamily:"'Courier New','SF Mono',monospace",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(45,212,191,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0}}/>

      {/* Header */}
      <div style={{position:"relative",zIndex:10,padding:"16px 16px 0",borderBottom:"1px solid rgba(45,212,191,0.15)"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:"10px",marginBottom:"4px"}}>
          {onBack && <button onClick={onBack} style={{padding:"4px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"4px",color:"#525252",cursor:"pointer",fontSize:"13px",fontFamily:"'Courier New',monospace",transition:"all 0.2s"}}>{"← 首页"}</button>}
          <h1 style={{fontSize:"14px",fontWeight:400,letterSpacing:"4px",textTransform:"uppercase",color:"#2dd4bf",margin:0}}>PROTEIN → ARCHITECTURE</h1>
        </div>
        <span style={{fontSize:"12px",color:"#525252"}}>蛋白质折叠结构的建筑学翻译</span>

        {/* Presets + PDB ID input */}
        <div style={{display:"flex",gap:"6px",padding:"12px 0 8px",overflowX:"auto",scrollbarWidth:"none",alignItems:"center"}}>
          {PRESETS.map(p=>(
            <button key={p.id} onClick={()=>{setSelected(p.id);setLoadError("")}} style={{
              flex:"0 0 auto",padding:"8px 12px",textAlign:"left",lineHeight:1.3,
              background:selected===p.id?"rgba(45,212,191,0.12)":"rgba(255,255,255,0.03)",
              border:`1px solid ${selected===p.id?"rgba(45,212,191,0.4)":"rgba(255,255,255,0.06)"}`,
              borderRadius:"4px",color:selected===p.id?"#2dd4bf":"#737373",
              cursor:"pointer",fontSize:"13px",fontFamily:"inherit",transition:"all 0.2s",
            }}>
              <div style={{fontWeight:600}}>{p.id}</div>
              <div style={{fontSize:"11px",opacity:0.7}}>{p.name}</div>
            </button>
          ))}
          {customData&&(
            <button onClick={()=>{setSelected("custom");setLoadError("")}} style={{
              flex:"0 0 auto",padding:"8px 12px",textAlign:"left",lineHeight:1.3,
              background:isCustom?"rgba(232,193,112,0.12)":"rgba(255,255,255,0.03)",
              border:`1px solid ${isCustom?"rgba(232,193,112,0.4)":"rgba(255,255,255,0.06)"}`,
              borderRadius:"4px",color:isCustom?"#e8c170":"#737373",
              cursor:"pointer",fontSize:"13px",fontFamily:"inherit",transition:"all 0.2s",
            }}>
              <div style={{fontWeight:600}}>{customName}</div>
              <div style={{fontSize:"11px",opacity:0.7}}>自定义</div>
            </button>
          )}
          <span style={{flex:1}}/>
          <div style={{flex:"0 0 auto",display:"flex",gap:"4px",alignItems:"stretch"}}>
            <input
              value={pdbIdInput}
              onChange={(e)=>setPdbIdInput(e.target.value.toUpperCase())}
              onKeyDown={(e)=>{if(e.key==="Enter")handleFetchPdb()}}
              placeholder="PDB ID"
              maxLength={6}
              style={{
                width:"88px",padding:"8px 10px",background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",borderRadius:"4px",
                color:"#e5e5e5",fontSize:"13px",fontFamily:"inherit",outline:"none",
                textAlign:"center",letterSpacing:"1px",boxSizing:"border-box",
              }}
            />
            <button onClick={handleFetchPdb} disabled={loadingPdb} style={{
              padding:"8px 14px",background:"rgba(232,193,112,0.12)",
              border:"1px solid rgba(232,193,112,0.3)",borderRadius:"4px",
              color:"#e8c170",cursor:loadingPdb?"wait":"pointer",
              fontSize:"13px",fontFamily:"inherit",whiteSpace:"nowrap",boxSizing:"border-box",
            }}>
              {loadingPdb?"...":"获取"}
            </button>
          </div>
        </div>
        {loadError&&<div style={{fontSize:"12px",color:"#ef4444",paddingBottom:"8px"}}>{loadError}</div>}
      </div>

      {/* View toggle */}
      <div style={{padding:"10px 16px",display:"flex",gap:"8px",position:"relative",zIndex:5}}>
        <TabBtn active={activeView==="protein"} onClick={()=>setActiveView("protein")} color="#2dd4bf">🧬 蛋白质</TabBtn>
        <TabBtn active={activeView==="arch"} onClick={()=>setActiveView("arch")} color="#e8c170">🏛 建筑</TabBtn>
        <TabBtn active={activeView==="both"} onClick={()=>setActiveView("both")} color="#94a3b8">⟷ 对比</TabBtn>
      </div>

      {/* 3D Views — flex:1 absorbs all remaining space */}
      <div style={{position:"relative",zIndex:5,flex:1,minHeight:0,display:"flex",alignItems:"stretch",justifyContent:"center",padding:activeView==="both"?"0 16px":0,gap:activeView==="both"?"2px":0}}>

        {/* Floating info panel — bottom left */}
        <div style={{position:"absolute",bottom:12,left:activeView==="both"?28:18,zIndex:20,maxWidth:showInfo?"380px":"auto",transition:"all 0.3s ease"}}>
          <div onClick={()=>setShowInfo(!showInfo)} style={{
            background:"rgba(10,10,10,0.85)",backdropFilter:"blur(10px)",
            border:"1px solid rgba(45,212,191,0.2)",borderRadius:"6px",
            padding:showInfo?"14px":"8px 12px",cursor:"pointer",transition:"all 0.3s ease",
          }}>
            {/* Collapsed: one-line summary */}
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"13px",color:"#2dd4bf",fontWeight:600}}>{isCustom?customName:selected}</span>
              {preset&&<span style={{fontSize:"12px",color:"#e8c170"}}>{preset.arch}</span>}
              <span style={{fontSize:"10px",color:"#525252",marginLeft:"4px"}}>{showInfo?"▼":"▶"}</span>
            </div>
            {/* Expanded: full details */}
            {showInfo&&(
              <div style={{marginTop:"10px",lineHeight:1.8}} onClick={(e)=>e.stopPropagation()}>
                {preset&&<div style={{fontSize:"13px",color:"#d4d4d4",marginBottom:"10px",paddingBottom:"8px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>{preset.archDetail}</div>}
                {isCustom&&<div style={{fontSize:"13px",color:"#d4d4d4",marginBottom:"10px",paddingBottom:"8px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>自定义蛋白质结构，已自动解析二级结构信息并翻译为建筑形态。</div>}
                <div style={{fontSize:"12px",color:"#a3a3a3",lineHeight:1.9}}>
                  <div style={{marginBottom:"4px"}}><span style={{color:"#2dd4bf"}}>▸</span> α螺旋轴线 → 柱网位置，长度 → 楼层数</div>
                  <div style={{marginBottom:"4px"}}><span style={{color:"#f59e0b"}}>▸</span> β折叠面积 → 建筑占地，跨度 → 层高</div>
                  <div style={{marginBottom:"4px"}}><span style={{color:"#6b7280"}}>▸</span> 卷曲走向 → 连廊路径，带扶手和支撑柱</div>
                  <div><span style={{color:"#e8c170"}}>▸</span> 每条链 → 独立建筑单元，共享地基和景观</div>
                </div>
                {data&&(
                  <div style={{marginTop:"10px",paddingTop:"8px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:"14px",flexWrap:"wrap"}}>
                    {[[data.atoms.length,"残基","房间"],[nHelix,"螺旋","塔楼"],[nSheet,"折叠","平层"],[nChains,"链","建筑群"]].map(([v,bio,arch],i)=>(
                      <div key={i}><div style={{fontSize:"16px",color:"#2dd4bf",fontWeight:600}}>{v}</div><div style={{fontSize:"10px",color:"#525252"}}>{bio} → {arch}</div></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{flex:activeView==="arch"?undefined:1,position:"relative",display:activeView==="arch"?"none":"flex",width:activeView==="both"?undefined:"100%"}}>
          <div style={{position:"absolute",top:10,left:activeView==="both"?10:18,fontSize:"11px",color:"#2dd4bf",letterSpacing:"2px",zIndex:10,background:"rgba(0,0,0,0.6)",padding:"4px 10px",borderRadius:"3px"}}>
            {activeView==="both"?"PROTEIN":"PROTEIN STRUCTURE"}
          </div>
          <canvas ref={pRef} style={{width:"100%",height:"100%",display:"block",cursor:"grab",borderRadius:activeView==="both"?"4px":0,border:activeView==="both"?"1px solid rgba(45,212,191,0.15)":"none"}}/>
        </div>
        <div style={{flex:activeView==="protein"?undefined:1,position:"relative",display:activeView==="protein"?"none":"flex",width:activeView==="both"?undefined:"100%"}}>
          <div style={{position:"absolute",top:10,left:activeView==="both"?10:18,fontSize:"11px",color:"#e8c170",letterSpacing:"2px",zIndex:10,background:"rgba(0,0,0,0.6)",padding:"4px 10px",borderRadius:"3px"}}>
            {activeView==="both"?"ARCHITECTURE":"ARCHITECTURAL TRANSLATION"}
          </div>
          <canvas ref={aRef} style={{width:"100%",height:"100%",display:"block",cursor:"grab",borderRadius:activeView==="both"?"4px":0,border:activeView==="both"?"1px solid rgba(232,193,112,0.15)":"none"}}/>
        </div>
      </div>

      {/* Bottom bar — fixed at page bottom */}
      <div style={{flexShrink:0,position:"relative",zIndex:5,padding:"8px 16px",borderTop:"1px solid rgba(45,212,191,0.08)",display:"flex",alignItems:"center",gap:"20px",flexWrap:"wrap"}}>
        {/* Legend */}
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap",flex:1}}>
          {[["#2dd4bf","#d4c5a0","α螺旋","塔楼+柱网"],["#f59e0b","#7a8a6b","β折叠","平层建筑"],["#6b7280","#8a8a8a","卷曲","走廊天桥"]].map(([c1,c2,f,t],i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px"}}>
              <div style={{width:"8px",height:"8px",borderRadius:"2px",background:c1}}/>
              <span style={{color:"#737373"}}>{f}</span>
              <span style={{color:"#404040"}}>→</span>
              <div style={{width:"8px",height:"8px",borderRadius:"2px",background:c2}}/>
              <span style={{color:"#a3a3a3"}}>{t}</span>
            </div>
          ))}
        </div>
        {/* Info summary */}
        {data&&(
          <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
            {[[data.atoms.length,"残基"],[nHelix,"螺旋"],[nSheet,"折叠"],[nChains,"链"]].map(([v,label],i)=>(
              <div key={i} style={{display:"flex",alignItems:"baseline",gap:"3px"}}>
                <span style={{fontSize:"14px",color:"#2dd4bf",fontWeight:600}}>{v}</span>
                <span style={{fontSize:"10px",color:"#525252"}}>{label}</span>
              </div>
            ))}
          </div>
        )}
        {/* Hint */}
        <div style={{fontSize:"10px",color:"#333",letterSpacing:"2px"}}>DRAG TO ROTATE · SCROLL TO ZOOM</div>
      </div>
    </div>
  );
}
