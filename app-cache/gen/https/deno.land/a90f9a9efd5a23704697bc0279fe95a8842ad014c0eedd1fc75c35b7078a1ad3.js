export function exponentialBackoff({ multiplier = 2, maxInterval = 5000, minInterval = 500 } = {}) {
  return (attempts)=>Math.min(maxInterval, minInterval * multiplier ** (attempts - 1));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMzEuMC9iYWNrb2ZmLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgQmFja29mZiB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IGJhY2tvZmYgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzXG4gICAqL1xuICAoYXR0ZW1wdHM6IG51bWJlcik6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHBvbmVudGlhbEJhY2tvZmZPcHRpb25zIHtcbiAgLyoqXG4gICAqIEBkZWZhdWx0IDJcbiAgICovXG4gIG11bHRpcGxpZXI6IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBtYXhpbXVtIGJhY2tvZmYgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzXG4gICAqIEBkZWZhdWx0IDUwMDBcbiAgICovXG4gIG1heEludGVydmFsOiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgbWluaW11bSBiYWNrb2ZmIGludGVydmFsIGluIG1pbGxpc2Vjb25kc1xuICAgKiBAZGVmYXVsdCA1MDBcbiAgICovXG4gIG1pbkludGVydmFsOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbEJhY2tvZmYoe1xuICBtdWx0aXBsaWVyID0gMixcbiAgbWF4SW50ZXJ2YWwgPSA1MDAwLFxuICBtaW5JbnRlcnZhbCA9IDUwMCxcbn06IFBhcnRpYWw8RXhwb25lbnRpYWxCYWNrb2ZmT3B0aW9ucz4gPSB7fSk6IEJhY2tvZmYge1xuICByZXR1cm4gKGF0dGVtcHRzKSA9PlxuICAgIE1hdGgubWluKG1heEludGVydmFsLCBtaW5JbnRlcnZhbCAqIChtdWx0aXBsaWVyICoqIChhdHRlbXB0cyAtIDEpKSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBd0JBLE9BQU8sU0FBUyxtQkFBbUIsRUFDakMsYUFBYSxDQUFDLEVBQ2QsY0FBYyxJQUFJLEVBQ2xCLGNBQWMsR0FBRyxFQUNrQixHQUFHLENBQUMsQ0FBQztFQUN4QyxPQUFPLENBQUMsV0FDTixLQUFLLEdBQUcsQ0FBQyxhQUFhLGNBQWUsY0FBYyxDQUFDLFdBQVcsQ0FBQztBQUNwRSJ9