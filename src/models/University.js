class University {
  constructor({ university_id, university_name, location, website, university_description }) {
    if (!university_name || !location || !website) {
      throw new Error('Missing required properties: university_name, location, website');
    }
    this._university_id = university_id;
    this._university_name = university_name;
    this._location = location;
    this._website = website;
    this._university_description = university_description;
  }

  get university_id() {
    return this._university_id;
  }

  get university_name() {
    return this._university_name;
  }

  set university_name(value) {
    if (!value) {
      throw new Error('university_name is required');
    }
    this._university_name = value;
  }

  get location() {
    return this._location;
  }

  set location(value) {
    if (!value) {
      throw new Error('location is required');
    }
    this._location = value;
  }

  get website() {
    return this._website;
  }

  set website(value) {
    if (!value) {
      throw new Error('website is required');
    }
    this._website = value;
  }

  get university_description() {
    return this._university_description;
  }

  set university_description(value) {
    this._university_description = value;
  }
}

export default University;
