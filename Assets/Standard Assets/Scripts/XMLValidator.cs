

using UnityEngine;
using System.Collections;
using System.Text;
using System.Xml;
using System.IO;
using System.Xml.Schema;

// adapated from http://jerrytech.blogspot.com/2008/12/validate-xmlxsd-using-xmlreadersettings.html

public class XMLValidator : MonoBehaviour {
	
	private bool isValid;
	private string log;
	
	public bool ValidateXml(string xmlFileLocation, string xsdString, ref string errorLog) {
		isValid = true;
		log = "";
		try {
			string xml = "";
			//string xsdString = "";
			

			using(StreamReader rdr = File.OpenText(xmlFileLocation)) {
				xml = rdr.ReadToEnd();
			}
			
			// build XSD schema
			StringReader _XsdStream = new StringReader(xsdString);

			XmlSchema _XmlSchema = XmlSchema.Read(_XsdStream, null);

			// build settings (this replaces XmlValidatingReader)
			XmlReaderSettings settings = new XmlReaderSettings();
			settings.ValidationType = ValidationType.Schema;
			settings.Schemas.Add(_XmlSchema);
			settings.IgnoreComments = true;
			settings.IgnoreProcessingInstructions = true;
			settings.IgnoreWhitespace = true;
			settings.ValidationEventHandler += new ValidationEventHandler(ValidationCallBack);

			// build XML reader
			StringReader _XmlStream = new StringReader(xml);

			XmlReader _XmlReader = XmlReader.Create(_XmlStream, settings);

			// validate
			using (_XmlReader) {
				while (_XmlReader.Read());
			}
		} catch {
			isValid = false;
		}
		errorLog = log;
		return isValid;
	}
	
	private void ValidationCallBack (object sender, ValidationEventArgs args) {
		if (args.Severity == XmlSeverityType.Warning) {
			//Debug.Log("Warning: " + args.Message);
			log += "Warning: " + args.Message + "\n";
		} else {
			if (args.Message.IndexOf("Character content not allowed") == -1) { // ignore this error which gets thrown all the time for no reason
				isValid = false;
				//Debug.Log("Error: " + args.Message);
				log += "Error: " + args.Message + "\n";
			}
		}
	} 
}

