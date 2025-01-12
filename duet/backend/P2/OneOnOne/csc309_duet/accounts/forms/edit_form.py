from django import forms

class EditForm(forms.Form):
    password1 = forms.CharField(required=False, widget=forms.PasswordInput())
    password2 = forms.CharField(required=False, widget=forms.PasswordInput())
    email = forms.EmailField(required=False)
    first_name = forms.CharField(required=False)
    last_name = forms.CharField(required=False)