let uuid = 1;

export const updatePagesOrder = (newPages) => {
  for (let index = 0; index < newPages.length; index++) {
    const page = newPages[index];
    page.order = index + 1;
  }
  return newPages;
};

export function addMultipleEventListener(elements, events, action) {
  elements.forEach((elem) => {
    events.forEach((evt) => elem.addEventListener(evt, action));
  });
}

export function removeMultipleEventListener(elements, events, action) {
  elements.forEach((elem) => {
    events.forEach((evt) => elem.removeEventListener(evt, action));
  });
}

export async function generatePages(addPage) {
  for (let index = 0; index < 5; index++) {
    let id = uuid++;
    addPage({
      id,
      order: id,
      content: id,
      rotation: 0,
    });
  }
}

export const rotateLeft = (prevRotation) => {
  let newRotation = 0;
  if (prevRotation === 0) {
    newRotation = 270;
  } else if (prevRotation === 270) {
    newRotation = 180;
  } else if (prevRotation === 180) {
    newRotation = 90;
  } else if (prevRotation === 90) {
    newRotation = 0;
  }
  return newRotation;
};

export const rotateRight = (prevRotation) => {
  let newRotation = 0;
  if (prevRotation === 0) {
    newRotation = 90;
  } else if (prevRotation === 90) {
    newRotation = 180;
  } else if (prevRotation === 180) {
    newRotation = 270;
  } else if (prevRotation === 270) {
    newRotation = 0;
  }
  return newRotation;
};
