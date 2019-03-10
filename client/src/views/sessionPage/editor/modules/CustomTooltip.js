import Quill from 'quill';

import uploadIcon from '!raw-loader!@/assets/upload.svg';

const Delta = Quill.import('delta');

export default function() {
  /* eslint-disable no-param-reassign */
  const { editor } = this;
  const { tooltip } = editor.theme;

  const oldEdit = tooltip.edit;
  // const oldPosition = tooltip.position;
  const oldSave = tooltip.save;

  tooltip.enableImage = function({ index }) {
    tooltip.root.setAttribute('data-image', index);
    tooltip.root.classList.add('vinegar-ql-image');
  };

  const newShow = function({ height, left, top }) {
    tooltip.root.style.left = `${left - 15}px`;
    tooltip.root.style.top = `${top + height - 5}px`;

    const containerBounds = tooltip.boundsContainer.getBoundingClientRect();
    const rootBounds = tooltip.root.getBoundingClientRect();
    const normalizedTop = rootBounds.top + tooltip.boundsContainer.children[0].scrollTop;

    let shift;
    if (rootBounds.right > containerBounds.right) {
      tooltip.root.style.left = 'unset';
      tooltip.root.style.right = '0px';
    }
    if (rootBounds.left < containerBounds.left) {
      shift = containerBounds.left - rootBounds.left;
      tooltip.root.style.left = `${left + shift}px`;
    }
    if (rootBounds.bottom > containerBounds.bottom) {
      shift = tooltip.root.clientHeight + 12;
      tooltip.root.style.top = `${normalizedTop - shift - 3}px`;
    }
    if (normalizedTop < containerBounds.top) {
      tooltip.root.style.top = '-10px';
    }
    tooltip.root.style.marginTop = '';
  };

  tooltip.newShow = newShow;

  tooltip.save = function(...args) {
    let { value } = tooltip.textbox;

    if (!value) {
      return;
    }

    let hasHttp = value.indexOf('http') > -1 || value.indexOf('https') > -1;
    const isEmail = /^\S+@\S+\.\S+$/.test(value) && value.indexOf('mailto:') !== 0;

    if (isEmail && !hasHttp) {
      value = `mailto:${value}`;
      hasHttp = true;
    }

    if (!hasHttp) {
      value = `http://${value}`;
    }

    tooltip.textbox.value = value;

    if (tooltip.root.hasAttribute('data-image')) {
      const index = tooltip.root.getAttribute('data-image');
      editor.insertEmbed(index, 'image', value, Quill.sources.USER);
      editor.focus();

      const image = document.querySelectorAll(`[src="${value}"]`);
      for (let i = 0; i < image.length; i += 1) {
        const downloadedImg = image[i];
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = downloadedImg.width;
        canvas.height = downloadedImg.height;
        context.drawImage(downloadedImg, 0, 0);

        try {
          const dataUrl = canvas.toDataURL();
          downloadedImg.src = dataUrl;
        } catch (_) {
          downloadedImg.src = 'invalid';
          return;
        }
      }

      tooltip.hide();
    } else {
      oldSave.apply(this, args);
      tooltip.preview.textContent = value;
      tooltip.preview.setAttribute('href', value);
      tooltip.show();
    }
  };

  tooltip.edit = function(...args) {
    oldEdit.apply(this, args);
    tooltip.textbox.placeholder = 'Enter a link...';
  };

  tooltip.position = function(...args) {
    if (!tooltip.root.classList.contains('ql-editing')) {
      newShow(...args);
    }
  };

  tooltip.newLink = function({ index, length }) {
    tooltip.root.removeAttribute('data-image');
    tooltip.root.classList.remove('vinegar-ql-image');

    const bounds = editor.getBounds(index, length);
    newShow(bounds);
  };

  const uploadWrapper = document.createElement('button');
  uploadWrapper.classList.add('vinegar-ql-upload-wrapper');
  uploadWrapper.innerHTML = uploadIcon;

  const upload = document.createElement('input');
  upload.type = 'file';
  upload.accept = 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon';
  upload.classList.add('vinegar-ql-upload');
  upload.onchange = () => {
    const index = tooltip.root.getAttribute('data-image');

    const { files } = upload;

    if (files != null && files[0] != null) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.updateContents(new Delta()
          .retain(index)
          .delete(0)
          .insert({ image: e.target.result })
        , Quill.sources.USER);

        editor.focus();
        tooltip.hide();
        upload.value = '';
      }
      reader.readAsDataURL(files[0]);
    }
  };

  uploadWrapper.appendChild(upload);
  uploadWrapper.onclick = () => {
    upload.click();
  };

  tooltip.root.appendChild(uploadWrapper);
  /* eslint-enable no-param-reassign */
};
